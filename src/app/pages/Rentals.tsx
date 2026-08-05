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

    /*
      أول ضغطة:
      البداية والنهاية تكون نفس اليوم، لذلك يظهر يوم واحد والسعر مباشرة.

      الضغطة الثانية:
      إذا كانت بعد البداية، تصبح تاريخ النهاية.
      إذا كانت قبل البداية، يبدأ اختيار جديد من ذلك اليوم.
    */
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
      className="min-h-screen bg-[#F8F7F2] px-4 py-10 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 rounded-[36px] bg-[#0F3A2B] px-6 py-12 text-center text-white shadow-xl">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#E5D8AA]" />

          <h1 className="text-4xl font-black md:text-5xl">تأجير الدرونات</h1>

          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            اختر الدرون وحدد مدة الإيجار. الأيام المحجوزة تظهر تلقائيًا ولا
            يمكن اختيارها.
          </p>
        </section>

        {error && !selectedDrone && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center gap-2 py-20">
            <Loader2 className="animate-spin" />
            جاري التحميل...
          </div>
        ) : drones.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center">
            لا توجد درونات متاحة حاليًا
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {drones.map((drone) => (
              <article
                key={drone.id}
                className="overflow-hidden rounded-[30px] border border-[#DED7C9] bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-[#F8F7F2] p-3">
                  {drone.image_url ? (
                    <img
                      src={drone.image_url}
                      alt={drone.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-black">{drone.name}</h2>

                  <p className="mt-3 min-h-[52px] text-sm leading-7 text-gray-600">
                    {drone.description || "درون متاح للإيجار اليومي."}
                  </p>

                  <div className="mt-5 flex items-end justify-between border-t pt-5">
                    <div>
                      <p className="text-xs text-gray-500">سعر اليوم</p>

                      <p className="text-2xl font-black">
                        {Number(drone.daily_price).toFixed(3)} ر.ع
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void openBooking(drone)}
                      className="rounded-full bg-[#0F3A2B] px-6 py-3 font-bold text-white"
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
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/55 p-3 backdrop-blur-sm">
          <div className="mx-auto my-3 max-w-6xl rounded-[32px] bg-[#F8F7F2] shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-[#F8F7F2] px-6 py-4">
              <div>
                <p className="text-xs text-gray-500">حجز درون</p>

                <h2 className="text-2xl font-black">{selectedDrone.name}</h2>
              </div>

              <button
                type="button"
                onClick={() => !saving && setSelectedDrone(null)}
                className="rounded-full bg-white p-3"
                aria-label="إغلاق"
              >
                <X />
              </button>
            </div>

            {success ? (
              <div className="mx-auto max-w-xl px-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Check className="h-10 w-10" />
                </div>

                <h3 className="mt-6 text-3xl font-black">
                  تم استلام طلب الإيجار
                </h3>

                <p className="mt-3 text-gray-600">
                  رقم الحجز #{success.id}. سنتواصل معك لتأكيد الحجز.
                </p>

                <div className="mt-6 rounded-3xl bg-white p-5 leading-8">
                  من {formatDisplayDate(success.start_date)}
                  <br />
                  إلى {formatDisplayDate(success.end_date)}
                  <br />
                  {success.total_days} يوم —{" "}
                  {Number(success.total_amount).toFixed(3)} ر.ع
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDrone(null)}
                  className="mt-6 rounded-full bg-[#0F3A2B] px-10 py-4 font-bold text-white"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="grid gap-6 p-5 lg:grid-cols-[1.25fr_.75fr]">
                <section className="rounded-[28px] border bg-white p-5">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black">اختر مدة الإيجار</h3>

                      <p className="text-sm text-gray-500">
                        اضغط يومًا واحدًا لحجز يوم واحد، أو اختر يومًا ثانيًا
                        لتحديد نهاية الحجز
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-full bg-[#F8F7F2] p-1">
                      <button
                        type="button"
                        onClick={() => moveMonth(-1)}
                        disabled={
                          visibleMonth.getFullYear() === now.getFullYear() &&
                          visibleMonth.getMonth() === now.getMonth()
                        }
                        className="rounded-full bg-white p-2 disabled:opacity-30"
                      >
                        <ChevronRight />
                      </button>

                      <strong className="min-w-[145px] text-center">
                        {MONTHS[visibleMonth.getMonth()]}{" "}
                        {visibleMonth.getFullYear()}
                      </strong>

                      <button
                        type="button"
                        onClick={() => moveMonth(1)}
                        className="rounded-full bg-white p-2"
                      >
                        <ChevronLeft />
                      </button>
                    </div>
                  </div>

                  {loadingDates ? (
                    <div className="flex justify-center py-24">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 sm:text-xs">
                        {WEEK_DAYS.map((day) => (
                          <div key={day} className="px-0.5 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                              className={`aspect-square rounded-xl border font-bold transition ${
                                booked
                                  ? "bg-red-50 text-red-300 line-through"
                                  : past
                                    ? "bg-gray-50 text-gray-300"
                                    : selected
                                      ? "bg-[#0F3A2B] text-white"
                                      : insideRange
                                        ? "bg-[#F0E8CF]"
                                        : "bg-white hover:border-[#0F3A2B]"
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        الأحمر محجوز — الرمادي غير متاح
                      </div>
                    </>
                  )}
                </section>

                <aside>
                  <div className="mb-5 rounded-[28px] border bg-white p-5">
                    <h3 className="text-2xl font-black">
                      {selectedDrone.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      {selectedDrone.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#F8F7F2] p-3">
                        اليومي
                        <br />
                        <b>
                          {Number(selectedDrone.daily_price).toFixed(3)} ر.ع
                        </b>
                      </div>

                      <div className="rounded-2xl bg-[#F8F7F2] p-3">
                        التأمين
                        <br />
                        <b>
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
                    className="rounded-[28px] border bg-white p-5"
                  >
                    <h3 className="mb-4 text-xl font-black">بيانات الحجز</h3>

                    <input
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="الاسم الكامل"
                      className="mb-3 h-12 w-full rounded-2xl border bg-[#F8F7F2] px-4 outline-none focus:border-[#0F3A2B]"
                    />

                    <div
                      className="mb-3 flex items-center gap-2 rounded-2xl border bg-[#F8F7F2] px-4"
                      dir="ltr"
                    >
                      <Phone className="h-4 w-4" />

                      <input
                        value={phone}
                        onChange={(event) =>
                          setPhone(normalizePhoneNumber(event.target.value))
                        }
                        placeholder="968XXXXXXXX"
                        inputMode="numeric"
                        className="h-12 w-full bg-transparent outline-none"
                      />
                    </div>

                    <label className="block cursor-pointer rounded-2xl border border-dashed border-[#BDB5A5] bg-[#F8F7F2] p-4 transition hover:border-[#0F3A2B]">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReceiptChange}
                        className="hidden"
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                          {receiptFile ? (
                            <FileCheck2 className="h-5 w-5 text-green-700" />
                          ) : (
                            <UploadCloud className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold">
                            {receiptFile
                              ? "تم إرفاق إيصال التحويل"
                              : "أرفق إيصال التحويل"}
                          </p>

                          <p className="mt-1 max-w-[240px] truncate text-xs text-gray-500">
                            {receiptFile
                              ? receiptFile.name
                              : "JPG أو PNG أو WEBP — بحد أقصى 5MB"}
                          </p>
                        </div>
                      </div>
                    </label>

                    <div className="mt-4 rounded-2xl bg-[#F8F7F2] p-4 text-sm">
                      <div>
                        من: <b>{formatDisplayDate(startDate)}</b>
                      </div>

                      <div className="mt-1">
                        إلى: <b>{formatDisplayDate(endDate)}</b>
                      </div>

                      <div className="mt-1">
                        الأيام: <b>{totalDays}</b>
                      </div>

                      <div className="mt-3 border-t pt-3 text-lg">
                        الإجمالي: <b>{totalAmount.toFixed(3)} ر.ع</b>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
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
                      className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0F3A2B] font-black text-white disabled:opacity-50"
                    >
                      {saving || uploadingReceipt ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ShieldCheck />
                      )}

                      {uploadingReceipt
                        ? "جاري رفع الإيصال..."
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
