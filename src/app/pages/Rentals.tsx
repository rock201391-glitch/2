import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  ImageOff,
  Loader2,
  Phone,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface RentalDrone {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  daily_price: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
}

interface RentalBooking {
  id: number;
  rental_drone_id: number;
  customer_name: string;
  phone: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_price: number;
  total_amount: number;
  status: string;
  receipt_url: string | null;
  created_at: string;
}

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const WEEK_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "active"];

function normalizePhoneNumber(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/\D/g, "");
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getToday() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getRentalDays(startDate: string, endDate: string) {
  const difference =
    parseDate(endDate).getTime() - parseDate(startDate).getTime();

  return Math.max(1, Math.round(difference / 86400000) + 1);
}

function rangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return firstStart <= secondEnd && firstEnd >= secondStart;
}

function formatDisplayDate(value: string) {
  if (!value) return "لم يحدد";

  return parseDate(value).toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Rentals() {
  const now = useMemo(() => getToday(), []);

  const [drones, setDrones] = useState<RentalDrone[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<RentalDrone | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RentalBooking | null>(null);

  useEffect(() => {
    void loadDrones();
  }, []);

  async function loadDrones() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("rental_drones")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error(loadError);
      setError("تعذر تحميل درونات الإيجار. تأكد من تشغيل ملف SQL.");
      setDrones([]);
    } else {
      setDrones((data as RentalDrone[]) || []);
    }

    setLoading(false);
  }

  async function openBooking(drone: RentalDrone) {
    setSelectedDrone(drone);
    setStartDate("");
    setEndDate("");
    setCustomerName("");
    setPhone("");
    setReceiptFile(null);
    setError("");
    setSuccess(null);
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setLoadingDates(true);

    const { data, error: datesError } = await supabase
      .from("rental_bookings")
      .select("*")
      .eq("rental_drone_id", drone.id)
      .in("status", ACTIVE_BOOKING_STATUSES);

    if (datesError) {
      console.error(datesError);
      setError("تعذر تحميل التواريخ المحجوزة");
      setBookings([]);
    } else {
      setBookings((data as RentalBooking[]) || []);
    }

    setLoadingDates(false);
  }

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];

    for (let index = 0; index < firstDayIndex; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [visibleMonth]);

  function isDateBooked(value: string) {
    return bookings.some(
      (booking) =>
        ACTIVE_BOOKING_STATUSES.includes(booking.status) &&
        value >= booking.start_date &&
        value <= booking.end_date,
    );
  }

  function isRangeAvailable(firstDate: string, lastDate: string) {
    return !bookings.some(
      (booking) =>
        ACTIVE_BOOKING_STATUSES.includes(booking.status) &&
        rangesOverlap(
          firstDate,
          lastDate,
          booking.start_date,
          booking.end_date,
        ),
    );
  }

  function chooseDate(date: Date) {
    const value = dateKey(date);

    if (date < now || isDateBooked(value)) {
      return;
    }

    setError("");

    if (!startDate || (startDate && endDate && startDate !== endDate)) {
      setStartDate(value);
      setEndDate(value);
      return;
    }

    if (value < startDate) {
      setStartDate(value);
      setEndDate(value);
      return;
    }

    if (value === startDate) {
      setEndDate(value);
      return;
    }

    if (!isRangeAvailable(startDate, value)) {
      setError("يوجد حجز داخل هذه المدة. اختر مدة أخرى.");
      return;
    }

    setEndDate(value);
  }

  function moveMonth(amount: number) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1,
    );

    const minimumMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (nextMonth >= minimumMonth) {
      setVisibleMonth(nextMonth);
    }
  }

  function handleReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setReceiptFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("صيغة الإيصال يجب أن تكون JPG أو PNG أو WEBP");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم صورة الإيصال يجب ألا يتجاوز 5 ميجابايت");
      event.target.value = "";
      return;
    }

    setError("");
    setReceiptFile(file);
  }

  async function uploadReceipt() {
    if (!receiptFile) {
      throw new Error("أرفق إيصال التحويل");
    }

    setUploadingReceipt(true);

    try {
      const extension =
        receiptFile.type === "image/png"
          ? "png"
          : receiptFile.type === "image/webp"
            ? "webp"
            : "jpg";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("rental-receipts")
        .upload(filePath, receiptFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("rental-receipts")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploadingReceipt(false);
    }
  }

  const totalDays =
    startDate && endDate ? getRentalDays(startDate, endDate) : 0;

  const totalAmount = selectedDrone
    ? Number(selectedDrone.daily_price) * totalDays
    : 0;

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedDrone) return;

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!customerName.trim()) {
      setError("اكتب اسم المستأجر");
      return;
    }

    if (normalizedPhone.length < 8) {
      setError("رقم الهاتف يجب ألا يقل عن 8 أرقام");
      return;
    }

    if (!startDate || !endDate) {
      setError("اختر تاريخ الإيجار");
      return;
    }

    if (!receiptFile) {
      setError("أرفق إيصال التحويل");
      return;
    }

    setSaving(true);
    setError("");

    const { data: conflictingBookings, error: checkError } = await supabase
      .from("rental_bookings")
      .select("id")
      .eq("rental_drone_id", selectedDrone.id)
      .in("status", ACTIVE_BOOKING_STATUSES)
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    if (checkError) {
      console.error(checkError);
      setError("تعذر التأكد من توفر التاريخ");
      setSaving(false);
      return;
    }

    if ((conflictingBookings || []).length > 0) {
      setError("هذه المدة أصبحت محجوزة. اختر مدة أخرى.");
      setSaving(false);
      return;
    }

    let receiptUrl = "";

    try {
      receiptUrl = await uploadReceipt();
    } catch (uploadError) {
      console.error(uploadError);
      setError("تعذر رفع إيصال التحويل. حاول مرة أخرى.");
      setSaving(false);
      return;
    }

    const formattedPhone = normalizedPhone.startsWith("968")
      ? normalizedPhone
      : `968${normalizedPhone}`;

    const payload = {
      rental_drone_id: selectedDrone.id,
      customer_name: customerName.trim(),
      phone: formattedPhone,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      daily_price: Number(selectedDrone.daily_price),
      total_amount: totalAmount,
      status: "pending",
      receipt_url: receiptUrl,
    };

    const { data, error: insertError } = await supabase
      .from("rental_bookings")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error(insertError);
      setError("حدث خطأ أثناء إرسال الحجز أو يوجد تعارض في التاريخ");
    } else {
      const createdBooking = data as RentalBooking;

      setSuccess(createdBooking);
      setBookings((current) => [...current, createdBooking]);
      setCustomerName("");
      setPhone("");
      setReceiptFile(null);
    }

    setSaving(false);
  }

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#0f3a2b]"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">
        <section className="mb-12 rounded-[36px] bg-[#0f3a2b] px-6 py-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E5D8AA_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <CalendarDays className="mx-auto mb-4 h-14 w-14 text-[#E5D8AA] relative z-10" />

          <h1 className="text-4xl font-black md:text-5xl tracking-tight relative z-10">تأجير الدرونات</h1>

          <p className="mx-auto mt-4 max-w-2xl text-white/80 text-lg leading-relaxed relative z-10">
            اختر الدرون المناسب وحدد مدة الإيجار بكل سهولة. الأيام المحجوزة تحدد تلقائياً لضمان تجربتك.
          </p>
        </section>

        {error && !selectedDrone && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700 border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#0f3a2b]">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f3a2b]" />
            <span className="font-bold text-lg">جاري تحميل الدرونات...</span>
          </div>
        ) : drones.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center text-gray-500 shadow-sm border border-[#EFECE6] text-lg font-bold">
            لا توجد درونات متاحة حاليًا
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {drones.map((drone) => (
              <article
                key={drone.id}
                className="group overflow-hidden rounded-[32px] border border-[#E7E2D3] bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#0f3a2b]/30 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full bg-[#FAF8F5] relative overflow-hidden border-b border-[#F0EBE1]">
                    {drone.image_url ? (
                      <img
                        src={drone.image_url}
                        alt={drone.name}
                        className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-gray-400">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-7">
                    <h2 className="text-2xl font-black text-[#0f3a2b]">{drone.name}</h2>

                    <p className="mt-3 min-h-[52px] text-sm leading-relaxed text-gray-600">
                      {drone.description || "درون متاح للإيجار اليومي بكفاءة عالية."}
                    </p>
                  </div>
                </div>

                <div className="px-7 pb-7 pt-2">
                  <div className="flex items-end justify-between border-t border-[#F0EBE1] pt-5">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-1">سعر اليوم</p>
                      <p className="text-2xl font-black text-[#0f3a2b]">
                        {Number(drone.daily_price).toFixed(3)} <span className="text-sm font-bold text-gray-500">ر.ع</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void openBooking(drone)}
                      className="rounded-2xl bg-[#0f3a2b] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#0f3a2b]/20 transition-all hover:bg-[#09251c] active:scale-95"
                    >
                      اختر واحجز
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedDrone && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center animate-fadeIn">
          <div className="mx-auto w-full max-w-6xl rounded-[36px] bg-[#FDFBF7] shadow-2xl border border-[#EFECE6] overflow-hidden my-auto">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EFECE6] bg-[#FDFBF7]/90 px-8 py-5 backdrop-blur-md">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">حجز درون</span>
                <h2 className="text-2xl font-black text-[#0f3a2b]">{selectedDrone.name}</h2>
              </div>

              <button
                type="button"
                onClick={() => !saving && setSelectedDrone(null)}
                className="rounded-full bg-white p-3 shadow-sm border border-[#EFECE6] text-gray-500 hover:text-[#0f3a2b] transition hover:bg-gray-50"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="mx-auto max-w-xl px-6 py-20 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
                  <Check className="h-12 w-12" />
                </div>

                <h3 className="mt-6 text-3xl font-black text-[#0f3a2b]">
                  تم استلام طلب الإيجار بنجاح
                </h3>

                <p className="mt-3 text-gray-600 text-lg">
                  رقم الحجز <span className="font-bold text-[#0f3a2b]">#{success.id}</span>. سنتواصل معك قريبًا لتأكيد الحجز.
                </p>

                <div className="mt-8 rounded-3xl bg-white p-6 leading-9 border border-[#EFECE6] shadow-sm text-right">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">من تاريخ:</span>
                    <span className="font-bold">{formatDisplayDate(success.start_date)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">إلى تاريخ:</span>
                    <span className="font-bold">{formatDisplayDate(success.end_date)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">مدة الإيجار:</span>
                    <span className="font-bold">{success.total_days} أيام</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg">
                    <span className="text-gray-500">الإجمالي:</span>
                    <span className="font-black text-[#0f3a2b]">{Number(success.total_amount).toFixed(3)} ر.ع</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDrone(null)}
                  className="mt-8 rounded-2xl bg-[#0f3a2b] px-10 py-4 font-bold text-white shadow-lg transition hover:bg-[#09251c]"
                >
                  إغلاق النافذة
                </button>
              </div>
            ) : (
              <div className="grid gap-8 p-6 lg:grid-cols-[1.25fr_.75fr] items-start">
                <section className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-[#0f3a2b]">اختر مدة الإيجار</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        اضغط يومًا واحدًا لحجز يوم واحد، أو اختر يومًا ثانيًا لتحديد نهاية الحجز
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-[#F9F8F4] p-1.5 border border-[#EFECE6]">
                      <button
                        type="button"
                        onClick={() => moveMonth(-1)}
                        disabled={
                          visibleMonth.getFullYear() === now.getFullYear() &&
                          visibleMonth.getMonth() === now.getMonth()
                        }
                        className="rounded-xl bg-white p-2.5 shadow-sm disabled:opacity-30 text-[#0f3a2b] hover:bg-gray-50 transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <strong className="min-w-[145px] text-center text-sm font-black text-[#0f3a2b]">
                        {MONTHS[visibleMonth.getMonth()]}{" "}
                        {visibleMonth.getFullYear()}
                      </strong>

                      <button
                        type="button"
                        onClick={() => moveMonth(1)}
                        className="rounded-xl bg-white p-2.5 shadow-sm text-[#0f3a2b] hover:bg-gray-50 transition"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {loadingDates ? (
                    <div className="flex justify-center py-24">
                      <Loader2 className="animate-spin h-8 w-8 text-[#0f3a2b]" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400">
                        {WEEK_DAYS.map((day) => (
                          <div key={day} className="py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2.5">
                        {calendarCells.map((date, index) => {
                          if (!date) {
                            return <div key={`empty-${index}`} />;
                          }

                          const value = dateKey(date);
                          const booked = isDateBooked(value);
                          const past = date < now;
                          const selected =
                            value === startDate || value === endDate;
                          const insideRange =
                            startDate &&
                            endDate &&
                            value > startDate &&
                            value < endDate;

                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={past || booked}
                              onClick={() => chooseDate(date)}
                              className={`aspect-square rounded-2xl border text-sm font-black transition-all flex items-center justify-center ${
                                booked
                                  ? "bg-red-50/80 text-red-300 border-red-100 line-through cursor-not-allowed"
                                  : past
                                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                    : selected
                                      ? "bg-[#0f3a2b] text-white border-[#0f3a2b] shadow-lg shadow-[#0f3a2b]/20 scale-105 z-10"
                                      : insideRange
                                        ? "bg-[#F2ECE0] text-[#0f3a2b] border-[#E8DFCC]"
                                        : "bg-white text-[#0f3a2b] border-[#EFECE6] hover:border-[#0f3a2b] hover:shadow-md"
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex items-center gap-6 text-xs font-bold text-gray-500 pt-4 border-t border-[#F0EBE1]">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#0f3a2b]"></span>
                          <span>المحدد</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                          <span>الأحمر محجوز</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-gray-100"></span>
                          <span>الرمادي غير متاح</span>
                        </div>
                      </div>
                    </>
                  )}
                </section>

                <aside className="space-y-6">
                  <div className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm">
                    <h3 className="text-2xl font-black text-[#0f3a2b]">
                      {selectedDrone.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {selectedDrone.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-[#F9F8F4] p-4 border border-[#EFECE6]">
                        <span className="text-xs text-gray-400 font-bold block mb-1">الإيجار اليومي</span>
                        <b className="text-lg font-black text-[#0f3a2b]">
                          {Number(selectedDrone.daily_price).toFixed(3)} ر.ع
                        </b>
                      </div>

                      <div className="rounded-2xl bg-[#F9F8F4] p-4 border border-[#EFECE6]">
                        <span className="text-xs text-gray-400 font-bold block mb-1">مبلغ التأمين</span>
                        <b className="text-lg font-black text-[#0f3a2b]">
                          {Number(
                            selectedDrone.deposit_amount || 0,
                          ).toFixed(3)}{" "}
                          ر.ع
                        </b>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={submitBooking}
                    className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm"
                  >
                    <h3 className="mb-5 text-xl font-black text-[#0f3a2b]">بيانات الحجز</h3>

                    <input
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="الاسم الكامل"
                      className="mb-4 h-14 w-full rounded-2xl border border-[#EFECE6] bg-[#F9F8F4] px-5 outline-none focus:border-[#0f3a2b] focus:bg-white transition font-bold text-[#0f3a2b] placeholder:font-normal placeholder:text-gray-400"
                    />

                    <div
                      className="mb-4 flex items-center gap-3 rounded-2xl border border-[#EFECE6] bg-[#F9F8F4] px-5 focus-within:border-[#0f3a2b] focus-within:bg-white transition"
                      dir="ltr"
                    >
                      <Phone className="h-5 w-5 text-gray-400" />

                      <input
                        value={phone}
                        onChange={(event) =>
                          setPhone(normalizePhoneNumber(event.target.value))
                        }
                        placeholder="968XXXXXXXX"
                        inputMode="numeric"
                        className="h-14 w-full bg-transparent outline-none font-bold text-[#0f3a2b] placeholder:font-normal placeholder:text-gray-400 text-left"
                      />
                    </div>

                    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#DED7C5] bg-[#F9F8F4] p-5 transition hover:border-[#0f3a2b] hover:bg-white group">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReceiptChange}
                        className="hidden"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#EFECE6] group-hover:scale-105 transition">
                          {receiptFile ? (
                            <FileCheck2 className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <UploadCloud className="h-6 w-6 text-[#0f3a2b]" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="font-black text-[#0f3a2b]">
                            {receiptFile
                              ? "تم إرفاق إيصال التحويل"
                              : "أرفق إيصال التحويل"}
                          </p>
                        </div>
                      </div>
                    </label>

                    <div className="mt-5 rounded-2xl bg-[#F9F8F4] p-5 border border-[#EFECE6] space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>من:</span>
                        <b className="text-[#0f3a2b]">{formatDisplayDate(startDate)}</b>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>إلى:</span>
                        <b className="text-[#0f3a2b]">{formatDisplayDate(endDate)}</b>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>عدد الأيام:</span>
                        <b className="text-[#0f3a2b]">{totalDays} يوم</b>
                      </div>

                      <div className="mt-3 border-t border-[#EFECE6] pt-3 flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">الإجمالي:</span>
                        <b className="text-xl font-black text-[#0f3a2b]">{totalAmount.toFixed(3)} ر.ع</b>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-200">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        uploadingReceipt ||
                        !startDate ||
                        !endDate
                      }
                      className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0f3a2b] font-black text-white shadow-xl shadow-[#0f3a2b]/25 transition hover:bg-[#09251c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving || uploadingReceipt ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}

                      {uploadingReceipt
                        , "جاري رفع الإيصال..."
                        : saving
                          ? "جاري إرسال الحجز..."
                          : "إرسال طلب الحجز"}
                    </button>
                  </form>
                </aside>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
