import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eraser,
  FileCheck2,
  IdCard,
  Loader2,
  MapPin,
  PenLine,
  Phone,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { RentalCheckoutData } from "./Rentals";

interface RentalCheckoutProps {
  booking: RentalCheckoutData;
  onBack: () => void;
  onSuccess: () => void;
}

const GOVERNORATE_TO_WILAYAT: Record<string, string[]> = {
  مسقط: ["مسقط", "مطرح", "بوشر", "السيب", "العامرات", "قريات"],
  ظفار: [
    "صلالة",
    "طاقة",
    "مرباط",
    "رخيوت",
    "ثمريت",
    "ضلكوت",
    "المزيونة",
    "مقشن",
    "شليم وجزر الحلانيات",
    "سدح",
  ],
  مسندم: ["خصب", "دبا", "بخاء", "مدحاء"],
  البريمي: ["البريمي", "محضة", "السنينة"],
  الداخلية: [
    "نزوى",
    "بهلا",
    "منح",
    "الحمراء",
    "آدم",
    "إزكي",
    "سمائل",
    "بدبد",
    "الجبل الأخضر",
  ],
  "شمال الباطنة": ["صحار", "شناص", "لوى", "صحم", "الخابورة", "السويق"],
  "جنوب الباطنة": ["الرستاق", "العوابي", "نخل", "وادي المعاول", "بركاء", "المصنعة"],
  "جنوب الشرقية": ["صور", "الكامل والوافي", "جعلان بني بوحسن", "جعلان بني بو علي", "مصيرة"],
  "شمال الشرقية": ["إبراء", "المضيبي", "بدية", "القابل", "وادي بني خالد", "دماء والطائيين", "سناو"],
  الظاهرة: ["عبري", "ينقل", "ضنك"],
  الوسطى: ["هيما", "محوت", "الدقم", "الجازر"],
};

const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

const TERMS_TEXT = `أتعهد أنا صاحب البيانات الموضحة في هذا الطلب بأن جميع البيانات والمرفقات المقدمة صحيحة وتخصني. كما أتعهد بالمحافظة على الدرون وجميع ملحقاته واستعماله بطريقة نظامية وآمنة وللغرض المتفق عليه فقط، وعدم تسليمه أو تأجيره أو تمكين أي شخص آخر من استخدامه دون موافقة متجر مرقاب. وألتزم بإرجاع الدرون وجميع ملحقاته في الموعد المحدد وبنفس الحالة التي استلمتها عليها، وأتحمل مسؤولية أي تلف أو فقدان أو نقص أو تأخير ينتج عن سوء الاستخدام أو الإهمال أو مخالفة التعليمات، كما أوافق على تحمل التكاليف المترتبة على ذلك وفق تقييم المتجر.`;

function normalizePhoneNumber(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/\D/g, "");
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function validFullName(value: string) {
  return normalizeName(value).split(" ").filter(Boolean).length >= 3;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value: string) {
  return parseDate(value).toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function validateImage(file: File | null, label: string) {
  if (!file) return `أرفق ${label}`;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return `${label} يجب أن يكون JPG أو PNG أو WEBP`;
  }

  if (file.size > 5 * 1024 * 1024) {
    return `حجم ${label} يجب ألا يتجاوز 5 ميجابايت`;
  }

  return "";
}

async function uploadFile(
  bucket: string,
  folder: string,
  file: Blob,
  extension: string,
) {
  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType:
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function RentalCheckout({
  booking,
  onBack,
  onSuccess,
}: RentalCheckoutProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [wilayat, setWilayat] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const [step, setStep] = useState<"details" | "undertaking">("details");
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [signatureVersion, setSignatureVersion] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);

  const [receiptPreview, setReceiptPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");

  const wilayatOptions = useMemo(
    () => GOVERNORATE_TO_WILAYAT[governorate] || [],
    [governorate],
  );

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview("");
      return;
    }

    const url = URL.createObjectURL(receiptFile);
    setReceiptPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  useEffect(() => {
    if (!idCardFile) {
      setIdCardPreview("");
      return;
    }

    const url = URL.createObjectURL(idCardFile);
    setIdCardPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idCardFile]);

  function validateDetails() {
    if (!validFullName(fullName)) {
      return "اكتب الاسم الثلاثي كاملًا، ثلاثة أسماء على الأقل";
    }

    if (normalizePhoneNumber(phone).length < 8) {
      return "رقم الهاتف يجب ألا يقل عن 8 أرقام";
    }

    if (!governorate) return "اختر المحافظة";
    if (!wilayat) return "اختر الولاية";

    const receiptError = validateImage(receiptFile, "إيصال التحويل");
    if (receiptError) return receiptError;

    const idCardError = validateImage(idCardFile, "صورة البطاقة الشخصية");
    if (idCardError) return idCardError;

    return "";
  }

  function openUndertaking(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep("undertaking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finishBooking() {
    if (submitting) return;

    if (!signatureBlob) {
      setError("يجب توقيع التعهد قبل إرسال الطلب");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: conflicts, error: conflictError } = await supabase
        .from("rental_bookings")
        .select("id")
        .eq("rental_drone_id", booking.drone.id)
        .in("status", BLOCKING_STATUSES)
        .lte("start_date", booking.endDate)
        .gte("end_date", booking.startDate);

      if (conflictError) throw conflictError;

      if ((conflicts || []).length > 0) {
        setError("هذه المدة أصبحت محجوزة قبل إتمام الطلب، ارجع واختر مدة أخرى");
        setSubmitting(false);
        return;
      }

      const [receiptUrl, idCardUrl, signatureUrl] = await Promise.all([
        uploadFile(
          "rental-receipts",
          "receipts",
          receiptFile as File,
          getFileExtension(receiptFile as File),
        ),
        uploadFile(
          "rental-id-cards",
          "id-cards",
          idCardFile as File,
          getFileExtension(idCardFile as File),
        ),
        uploadFile(
          "rental-signatures",
          "signatures",
          signatureBlob,
          "png",
        ),
      ]);

      const normalizedPhone = normalizePhoneNumber(phone);
      const formattedPhone = normalizedPhone.startsWith("968")
        ? normalizedPhone
        : `968${normalizedPhone}`;

      const payload = {
        rental_drone_id: booking.drone.id,
        customer_name: normalizeName(fullName),
        phone: formattedPhone,
        governorate,
        wilayat,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_days: booking.totalDays,
        daily_price: Number(booking.drone.daily_price),
        total_amount: Number(booking.totalAmount),
        status: "pending",
        receipt_url: receiptUrl,
        id_card_url: idCardUrl,
        signature_url: signatureUrl,
        terms_text: TERMS_TEXT,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("rental_bookings")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccessId(Number(data.id));
    } catch (submitError) {
      console.error(submitError);
      setError("تعذر إتمام طلب الإيجار. تأكد من المرفقات وحاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId !== null) {
    return (
      <div
        className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#0F3A2B]"
        dir="rtl"
      >
        <div className="mx-auto max-w-xl rounded-[36px] border border-[#E7E2D3] bg-white p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h1 className="mt-6 text-3xl font-black">تم إرسال طلب الإيجار</h1>

          <p className="mt-3 text-lg leading-7 text-gray-600">
            رقم الحجز <b>#{successId}</b>. ظهر الطلب الآن في لوحة الإدارة
            مع التعهد والتوقيع وجميع المرفقات.
          </p>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-8 h-14 w-full rounded-2xl bg-[#0F3A2B] font-black text-white"
          >
            العودة إلى صفحة التأجير
          </button>
        </div>
      </div>
    );
  }

  if (step === "undertaking") {
    return (
      <div
        className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-[#0F3A2B]"
        dir="rtl"
      >
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setStep("details");
              setError("");
            }}
            className="mb-7 flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 font-bold"
          >
            <ChevronRight className="h-5 w-5" />
            العودة لتعديل البيانات
          </button>

          <div className="rounded-[36px] border border-[#E7E2D3] bg-white p-6 shadow-xl sm:p-9">
            <div className="mb-8 flex items-center gap-4 border-b pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-3xl font-black">تعهد استئجار الدرون</h1>
                <p className="mt-1 text-sm text-gray-500">
                  راجع البيانات، اقرأ التعهد، ثم وقّع في الخانة أسفل الصفحة.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="الاسم الثلاثي" value={normalizeName(fullName)} />
              <Detail label="رقم الهاتف" value={normalizePhoneNumber(phone)} />
              <Detail label="المحافظة" value={governorate} />
              <Detail label="الولاية" value={wilayat} />
              <Detail label="الدرون" value={booking.drone.name} />
              <Detail label="من" value={formatDate(booking.startDate)} />
              <Detail label="إلى" value={formatDate(booking.endDate)} />
              <Detail
                label="الإجمالي"
                value={`${booking.totalAmount.toFixed(3)} ر.ع`}
              />
            </div>

            <div className="mt-7 rounded-3xl border border-[#E7E2D3] bg-[#FAF8F5] p-6">
              <h2 className="mb-4 text-xl font-black">نص التعهد</h2>
              <p className="text-justify leading-9 text-gray-700">
                {TERMS_TEXT}
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <PreviewCard
                title="صورة البطاقة الشخصية"
                imageUrl={idCardPreview}
                icon={<IdCard className="h-6 w-6" />}
              />

              <PreviewCard
                title="إيصال التحويل"
                imageUrl={receiptPreview}
                icon={<Banknote className="h-6 w-6" />}
              />
            </div>

            <div className="mt-7 rounded-3xl border border-[#E7E2D3] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PenLine className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-black">توقيع المستأجر</h2>
                    <p className="text-sm text-gray-500">
                      وقّع بإصبعك على الهاتف أو باستخدام الماوس.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSignatureBlob(null);
                    setSignatureVersion((value) => value + 1);
                    setError("");
                  }}
                  className="flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 font-bold text-red-700"
                >
                  <Eraser className="h-4 w-4" />
                  مسح التوقيع
                </button>
              </div>

              <SignaturePad
                key={signatureVersion}
                onChange={setSignatureBlob}
              />
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void finishBooking()}
              className="mt-7 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#0F3A2B] text-lg font-black text-white disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  جاري رفع المرفقات وإرسال الطلب...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  أوافق على التعهد وإتمام الطلب
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={openUndertaking}
      className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex w-fit items-center gap-2 rounded-2xl border bg-white px-5 py-2.5 font-bold"
        >
          <ChevronRight className="h-5 w-5" />
          العودة لاختيار التاريخ
        </button>

        <h1 className="mb-10 text-center text-4xl font-black">
          إتمام حجز الدرون
        </h1>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <Section title="بيانات المستأجر" icon={<User className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    الاسم الثلاثي
                  </label>

                  <input
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setError("");
                    }}
                    placeholder="مثال: حمد محمد البلوشي"
                    className="h-14 w-full rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 font-bold outline-none focus:border-[#0F3A2B]"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    يجب كتابة ثلاثة أسماء على الأقل
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رقم الهاتف
                  </label>

                  <div
                    className="flex h-14 items-center gap-3 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 focus-within:border-[#0F3A2B]"
                    dir="ltr"
                  >
                    <Phone className="h-5 w-5 text-gray-400" />

                    <input
                      value={phone}
                      onChange={(event) => {
                        setPhone(normalizePhoneNumber(event.target.value));
                        setError("");
                      }}
                      placeholder="968XXXXXXXX"
                      inputMode="numeric"
                      className="h-full w-full bg-transparent text-left font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="موقع الاستلام" icon={<MapPin className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <FancySelect
                  label="المحافظة"
                  placeholder="اختر المحافظة"
                  value={governorate}
                  options={Object.keys(GOVERNORATE_TO_WILAYAT)}
                  onChange={(value) => {
                    setGovernorate(value);
                    setWilayat("");
                    setError("");
                  }}
                />

                <FancySelect
                  label="الولاية"
                  placeholder="اختر الولاية"
                  value={wilayat}
                  options={wilayatOptions}
                  disabled={!governorate}
                  onChange={(value) => {
                    setWilayat(value);
                    setError("");
                  }}
                />
              </div>
            </Section>

            <Section title="المرفقات" icon={<CreditCard className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <FileUpload
                  label="أرفق إيصال التحويل"
                  icon="receipt"
                  file={receiptFile}
                  onChange={(file) => {
                    setReceiptFile(file);
                    setError("");
                  }}
                />

                <FileUpload
                  label="أرفق صورة البطاقة الشخصية"
                  icon="id-card"
                  file={idCardFile}
                  onChange={(file) => {
                    setIdCardFile(file);
                    setError("");
                  }}
                />
              </div>
            </Section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-bold text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="space-y-6 rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm lg:sticky lg:top-28">
            {booking.drone.image_url && (
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#FAF8F5] p-3">
                <img
                  src={booking.drone.image_url}
                  alt={booking.drone.name}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <h2 className="text-2xl font-black">{booking.drone.name}</h2>

            <div className="space-y-3 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] p-5 text-sm">
              <SummaryRow label="من" value={formatDate(booking.startDate)} />
              <SummaryRow label="إلى" value={formatDate(booking.endDate)} />
              <SummaryRow
                label="عدد الأيام"
                value={`${booking.totalDays} يوم`}
              />
              <SummaryRow
                label="السعر اليومي"
                value={`${Number(booking.drone.daily_price).toFixed(3)} ر.ع`}
              />

              <div className="flex justify-between gap-3 border-t pt-4 text-lg">
                <span className="font-bold">الإجمالي</span>
                <b>{booking.totalAmount.toFixed(3)} ر.ع</b>
              </div>
            </div>

            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0F3A2B] font-black text-white"
            >
              <ShieldCheck className="h-5 w-5" />
              مراجعة التعهد
            </button>
          </aside>
        </div>
      </div>
    </form>
  );
}

function SignaturePad({
  onChange,
}: {
  onChange: (blob: Blob | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasSignatureRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);

      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      const context = canvas.getContext("2d");
      if (!context) return;

      context.scale(ratio, ratio);
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#0F3A2B";
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, rect.width, rect.height);
    };

    resize();
  }, []);

  function pointFromEvent(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;

    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    hasSignatureRef.current = true;
  }

  function stopDrawing(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;

    drawingRef.current = false;

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (!canvas || !hasSignatureRef.current) {
      onChange(null);
      return;
    }

    canvas.toBlob((blob) => onChange(blob), "image/png");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        className="h-56 w-full touch-none rounded-2xl border-2 border-dashed border-[#BDB5A5] bg-white shadow-inner"
      />

      <p className="mt-2 text-center text-xs text-gray-400">
        التوقيع داخل الإطار أعلاه
      </p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
        <div className="rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] p-2.5">
          {icon}
        </div>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FAF8F5] p-4">
      <small className="text-gray-500">{label}</small>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function PreviewCard({
  title,
  imageUrl,
  icon,
}: {
  title: string;
  imageUrl: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7E2D3] bg-[#FAF8F5] p-4">
      <div className="mb-3 flex items-center gap-2 font-black">
        {icon}
        {title}
      </div>

      <img
        src={imageUrl}
        alt={title}
        className="h-64 w-full rounded-2xl bg-white object-contain"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3 text-gray-600">
      <span>{label}</span>
      <b className="text-left text-[#0F3A2B]">{value}</b>
    </div>
  );
}

function FancySelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-14 w-full items-center justify-between rounded-2xl border px-5 text-right font-bold transition ${
          open
            ? "border-[#0F3A2B] bg-white shadow-lg"
            : "border-[#EFECE6] bg-[#FAF8F5]"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <span className={value ? "" : "text-gray-400"}>
          {value || placeholder}
        </span>

        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[22px] border border-[#E7E2D3] bg-white p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`mb-1 w-full rounded-xl px-4 py-3 text-right text-sm font-bold ${
                !value
                  ? "bg-[#0F3A2B] text-white"
                  : "hover:bg-[#F8F7F2]"
              }`}
            >
              {placeholder}
            </button>

            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`mb-1 w-full rounded-xl px-4 py-3 text-right text-sm font-bold ${
                  value === option
                    ? "bg-[#0F3A2B] text-white"
                    : "hover:bg-[#F8F7F2]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FileUpload({
  label,
  icon,
  file,
  onChange,
}: {
  label: string;
  icon: "receipt" | "id-card";
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const EmptyIcon = icon === "receipt" ? Banknote : IdCard;

  return (
    <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[#DED7C5] bg-[#FAF8F5] p-5 hover:border-[#0F3A2B]">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) =>
          onChange(event.target.files?.[0] || null)
        }
      />

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border bg-white">
          {file ? (
            <FileCheck2 className="h-7 w-7 text-emerald-600" />
          ) : (
            <EmptyIcon className="h-7 w-7" />
          )}
        </div>

        <div className="min-w-0 overflow-hidden">
          <p className="font-black">{label}</p>
          {file && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {file.name}
            </p>
          )}
        </div>
      </div>
    </label>
  );
}
