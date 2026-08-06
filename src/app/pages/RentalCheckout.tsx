import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Banknote,
  IdCard,
  FileCheck2,
  Loader2,
  MapPin,
  Phone,
  UploadCloud,
  User,
  ChevronDown,
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
        className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#0f3a2b]"
        dir="rtl"
      >
        <div className="mx-auto max-w-xl rounded-[36px] border border-[#E7E2D3] bg-white p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-[#0f3a2b]">
            تم إرسال طلب الإيجار
          </h1>

          <p className="mt-3 leading-7 text-gray-600 text-lg">
            رقم الحجز <span className="font-bold text-[#0f3a2b]">#{successId}</span>. ظهر الطلب الآن داخل لوحة الإدارة وسنتواصل معك بعد مراجعته.
          </p>

          <div className="mt-8 rounded-3xl bg-[#FAF8F5] p-6 leading-9 border border-[#EFECE6] text-right">
            <div className="font-black text-[#0f3a2b] text-lg mb-2">{booking.drone.name}</div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 text-sm text-gray-600">
              <span>من تاريخ:</span>
              <span className="font-bold text-[#0f3a2b]">{formatDate(booking.startDate)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>إلى تاريخ:</span>
              <span className="font-bold text-[#0f3a2b]">{formatDate(booking.endDate)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200/60 text-lg">
              <span className="font-bold text-gray-700">الإجمالي:</span>
              <span className="font-black text-[#0f3a2b]">{booking.totalAmount.toFixed(3)} ر.ع</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-8 h-14 w-full rounded-2xl bg-[#0f3a2b] font-black text-white shadow-xl shadow-[#0f3a2b]/25 transition hover:bg-[#09251c]"
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
      className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-[#0f3a2b]"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 font-bold text-[#0f3a2b] hover:opacity-80 transition bg-white px-5 py-2.5 rounded-2xl border border-[#E7E2D3] shadow-sm w-fit"
        >
          <ChevronRight className="h-5 w-5" />
          العودة لاختيار التاريخ
        </button>

        <h1 className="mb-10 text-center text-4xl font-black tracking-tight text-[#0f3a2b]">
          إتمام حجز الدرون
        </h1>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] text-[#0f3a2b] border border-[#EFECE6]">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-[#0f3a2b]">بيانات المستأجر</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0f3a2b]">
                    الاسم الثلاثي
                  </label>

                  <input
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setError("");
                    }}
                    placeholder="مثال: حمد محمد البلوشي"
                    className="h-14 w-full rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 outline-none focus:border-[#0f3a2b] focus:bg-white transition font-bold text-[#0f3a2b] placeholder:font-normal placeholder:text-gray-400"
                  />

                  <p className="mt-2 text-xs font-medium text-gray-400">
                    يجب كتابة ثلاثة أسماء على الأقل
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0f3a2b]">
                    رقم الهاتف
                  </label>

                  <div
                    className="flex h-14 items-center gap-3 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 focus-within:border-[#0f3a2b] focus-within:bg-white transition"
                    dir="ltr"
                  >
                    <Phone className="h-5 w-5 text-gray-400" />

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
                      className="h-full w-full bg-transparent outline-none font-bold text-[#0f3a2b] placeholder:font-normal placeholder:text-gray-400 text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] text-[#0f3a2b] border border-[#EFECE6]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-[#0f3a2b]">موقع الاستلام</h2>
              </div>

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
            </div>

            <div className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] text-[#0f3a2b] border border-[#EFECE6]">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-[#0f3a2b]">المرفقات</h2>
              </div>

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

              <p className="mt-4 text-xs font-medium text-gray-400">
                الصيغ المسموحة JPG وPNG وWEBP، والحد الأقصى 5MB لكل صورة.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-bold text-red-700 shadow-sm">
                {error}
              </div>
            )}
          </section>

          <aside className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm lg:sticky lg:top-28 space-y-6">
            {booking.drone.image_url && (
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] flex items-center justify-center">
                <img
                  src={booking.drone.image_url}
                  alt={booking.drone.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <h2 className="text-2xl font-black text-[#0f3a2b]">
              {booking.drone.name}
            </h2>

            <div className="space-y-3 rounded-2xl bg-[#FAF8F5] p-5 border border-[#EFECE6] text-sm">
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

              <div className="flex justify-between gap-3 border-t border-gray-200/80 pt-4 text-lg">
                <span className="font-bold text-gray-700">الإجمالي</span>
                <b className="text-xl font-black text-[#0f3a2b]">{booking.totalAmount.toFixed(3)} ر.ع</b>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0f3a2b] font-black text-white shadow-xl shadow-[#0f3a2b]/25 transition hover:bg-[#09251c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="flex justify-between gap-3 text-gray-600">
      <span>{label}</span>
      <b className="text-[#0f3a2b] text-left">{value}</b>
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
      <label className="mb-2 block text-sm font-bold text-[#0f3a2b]">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-14 w-full items-center justify-between rounded-2xl border px-5 text-right font-bold transition ${
          open
            ? "border-[#0f3a2b] bg-white shadow-[0_10px_30px_rgba(15,58,43,0.10)]"
            : "border-[#EFECE6] bg-[#FAF8F5]"
        } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-[#0f3a2b]/50"}`}
      >
        <span className={value ? "text-[#0f3a2b]" : "text-gray-400"}>
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
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[22px] border border-[#E7E2D3] bg-white p-2 shadow-[0_24px_70px_rgba(15,58,43,0.18)]">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`mb-1 flex w-full items-center rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                !value
                  ? "bg-[#0f3a2b] text-white"
                  : "text-[#0f3a2b] hover:bg-[#F8F7F2]"
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
                className={`mb-1 flex w-full items-center rounded-xl px-4 py-3 text-right text-sm font-bold transition last:mb-0 ${
                  value === option
                    ? "bg-[#0f3a2b] text-white"
                    : "text-[#0f3a2b] hover:bg-[#F8F7F2]"
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
    <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[#DED7C5] bg-[#FAF8F5] p-5 transition hover:border-[#0f3a2b] hover:bg-white">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) =>
          onChange(event.target.files?.[0] || null)
        }
      />

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#EFECE6] bg-white shadow-sm transition group-hover:scale-105">
          {file ? (
            <FileCheck2 className="h-7 w-7 text-emerald-600" />
          ) : (
            <EmptyIcon className="h-7 w-7 text-[#0f3a2b]" />
          )}
        </div>

        <div className="min-w-0 overflow-hidden">
          <p className="font-black text-[#0f3a2b]">{label}</p>

          {file && (
            <p className="mt-1 truncate text-xs font-medium text-gray-500">
              {file.name}
            </p>
          )}
        </div>
      </div>
    </label>
  );
}
