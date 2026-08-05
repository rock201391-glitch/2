import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Loader2,
  MapPin,
  Phone,
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
  "شمال الباطنة": [
    "صحار",
    "شناص",
    "لوى",
    "صحم",
    "الخابورة",
    "السويق",
  ],
  "جنوب الباطنة": [
    "الرستاق",
    "العوابي",
    "نخل",
    "وادي المعاول",
    "بركاء",
    "المصنعة",
  ],
  "جنوب الشرقية": [
    "صور",
    "الكامل والوافي",
    "جعلان بني بوحسن",
    "جعلان بني بو علي",
    "مصيرة",
  ],
  "شمال الشرقية": [
    "إبراء",
    "المضيبي",
    "بدية",
    "القابل",
    "وادي بني خالد",
    "دماء والطائيين",
    "سناو",
  ],
  الظاهرة: ["عبري", "ينقل", "ضنك"],
  الوسطى: ["هيما", "محوت", "الدقم", "الجازر"],
};

const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

function normalizePhoneNumber(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) =>
      String(arabicDigits.indexOf(digit)),
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(persianDigits.indexOf(digit)),
    )
    .replace(/\D/g, "");
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function validFullName(value: string) {
  const words = normalizeName(value).split(" ").filter(Boolean);
  return words.length >= 3;
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

async function uploadImage(
  bucket: string,
  folder: string,
  file: File,
) {
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);

  const wilayatOptions = useMemo(
    () => GOVERNORATE_TO_WILAYAT[governorate] || [],
    [governorate],
  );

  function validateForm() {
    if (!validFullName(fullName)) {
      return "اكتب الاسم الثلاثي كاملًا، ثلاثة أسماء على الأقل";
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (normalizedPhone.length < 8) {
      return "رقم الهاتف يجب ألا يقل عن 8 أرقام";
    }

    if (!governorate) {
      return "اختر المحافظة";
    }

    if (!wilayat) {
      return "اختر الولاية";
    }

    const receiptError = validateImage(
      receiptFile,
      "إيصال التحويل",
    );

    if (receiptError) return receiptError;

    const idCardError = validateImage(
      idCardFile,
      "صورة البطاقة الشخصية",
    );

    if (idCardError) return idCardError;

    return "";
  }

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault();

    if (submitting) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: conflicts, error: conflictError } =
        await supabase
          .from("rental_bookings")
          .select("id")
          .eq("rental_drone_id", booking.drone.id)
          .in("status", BLOCKING_STATUSES)
          .lte("start_date", booking.endDate)
          .gte("end_date", booking.startDate);

      if (conflictError) throw conflictError;

      if ((conflicts || []).length > 0) {
        setError(
          "هذه المدة أصبحت محجوزة قبل إتمام الطلب، ارجع واختر مدة أخرى",
        );
        setSubmitting(false);
        return;
      }

      const [receiptUrl, idCardUrl] = await Promise.all([
        uploadImage(
          "rental-receipts",
          "receipts",
          receiptFile as File,
        ),
        uploadImage(
          "rental-id-cards",
          "id-cards",
          idCardFile as File,
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
      setError(
        "تعذر إتمام طلب الإيجار. تأكد من الصور وحاول مرة أخرى",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (successId !== null) {
    return (
      <div
        className="min-h-screen bg-[#F8F7F2] px-4 py-12 text-[#0F3A2B]"
        dir="rtl"
      >
        <div className="mx-auto max-w-xl rounded-[34px] border bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <h1 className="mt-6 text-3xl font-black">
            تم إرسال طلب الإيجار
          </h1>

          <p className="mt-3 leading-7 text-gray-600">
            رقم الحجز #{successId}. ظهر الطلب الآن داخل لوحة الإدارة
            وسنتواصل معك بعد مراجعته.
          </p>

          <div className="mt-6 rounded-3xl bg-[#F8F7F2] p-5 leading-8">
            <b>{booking.drone.name}</b>
            <br />
            من {formatDate(booking.startDate)}
            <br />
            إلى {formatDate(booking.endDate)}
            <br />
            الإجمالي: {booking.totalAmount.toFixed(3)} ر.ع
          </div>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-7 h-14 w-full rounded-full bg-[#0F3A2B] font-black text-white"
          >
            العودة إلى صفحة التأجير
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitBooking}
      className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-7 flex items-center gap-2 font-bold"
        >
          <ChevronRight />
          العودة لاختيار التاريخ
        </button>

        <h1 className="mb-9 text-center text-4xl font-black">
          إتمام حجز الدرون
        </h1>

        <div className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-[30px] border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <User className="h-6 w-6" />
                <h2 className="text-2xl font-black">بيانات المستأجر</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                    className="h-14 w-full rounded-2xl border bg-[#FFFEFC] px-4 outline-none focus:border-[#0F3A2B]"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    يجب كتابة ثلاثة أسماء على الأقل
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رقم الهاتف
                  </label>

                  <div
                    className="flex h-14 items-center gap-2 rounded-2xl border bg-[#FFFEFC] px-4"
                    dir="ltr"
                  >
                    <Phone className="h-5 w-5" />

                    <input
                      value={phone}
                      onChange={(event) => {
                        setPhone(
                          normalizePhoneNumber(event.target.value),
                        );
                        setError("");
                      }}
                      placeholder="968XXXXXXXX"
                      inputMode="numeric"
                      className="h-full w-full bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6" />
                <h2 className="text-2xl font-black">موقع الاستلام</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    المحافظة
                  </label>

                  <select
                    value={governorate}
                    onChange={(event) => {
                      setGovernorate(event.target.value);
                      setWilayat("");
                      setError("");
                    }}
                    className="h-14 w-full rounded-2xl border bg-[#FFFEFC] px-4 outline-none focus:border-[#0F3A2B]"
                  >
                    <option value="">اختر المحافظة</option>

                    {Object.keys(GOVERNORATE_TO_WILAYAT).map(
                      (item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    الولاية
                  </label>

                  <select
                    value={wilayat}
                    disabled={!governorate}
                    onChange={(event) => {
                      setWilayat(event.target.value);
                      setError("");
                    }}
                    className="h-14 w-full rounded-2xl border bg-[#FFFEFC] px-4 outline-none disabled:opacity-50 focus:border-[#0F3A2B]"
                  >
                    <option value="">اختر الولاية</option>

                    {wilayatOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-2xl font-black">المرفقات</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FileUpload
                  label="أرفق إيصال التحويل"
                  file={receiptFile}
                  onChange={(file) => {
                    setReceiptFile(file);
                    setError("");
                  }}
                />

                <FileUpload
                  label="أرفق صورة البطاقة الشخصية"
                  file={idCardFile}
                  onChange={(file) => {
                    setIdCardFile(file);
                    setError("");
                  }}
                />
              </div>

              <p className="mt-4 text-xs text-gray-500">
                الصيغ المسموحة JPG وPNG وWEBP، والحد الأقصى 5MB
                لكل صورة.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="rounded-[30px] border bg-white p-6 shadow-sm lg:sticky lg:top-28">
            {booking.drone.image_url && (
              <div className="mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-[#F8F7F2] p-3">
                <img
                  src={booking.drone.image_url}
                  alt={booking.drone.name}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <h2 className="text-2xl font-black">
              {booking.drone.name}
            </h2>

            <div className="mt-5 space-y-3 rounded-2xl bg-[#F8F7F2] p-4 text-sm">
              <SummaryRow
                label="من"
                value={formatDate(booking.startDate)}
              />

              <SummaryRow
                label="إلى"
                value={formatDate(booking.endDate)}
              />

              <SummaryRow
                label="عدد الأيام"
                value={`${booking.totalDays} يوم`}
              />

              <SummaryRow
                label="السعر اليومي"
                value={`${Number(
                  booking.drone.daily_price,
                ).toFixed(3)} ر.ع`}
              />

              <div className="flex justify-between gap-3 border-t pt-3 text-lg">
                <span className="font-bold">الإجمالي</span>
                <b>{booking.totalAmount.toFixed(3)} ر.ع</b>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0F3A2B] font-black text-white disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري إرسال الطلب...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  إتمام طلب الإيجار
                </>
              )}
            </button>
          </aside>
        </div>
      </div>
    </form>
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
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <b className="text-left">{value}</b>
    </div>
  );
}

function FileUpload({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="cursor-pointer rounded-2xl border-2 border-dashed border-[#D7D0C2] bg-[#F8F7F2] p-5 transition hover:border-[#0F3A2B]">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) =>
          onChange(event.target.files?.[0] || null)
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          {file ? (
            <FileCheck2 className="h-6 w-6 text-green-700" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0">
          <p className="font-black">{label}</p>

          <p className="mt-1 truncate text-xs text-gray-500">
            {file ? file.name : "اضغط لاختيار الصورة"}
          </p>
        </div>
      </div>
    </label>
  );
}
