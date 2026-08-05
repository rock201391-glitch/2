import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export interface RentalDrone {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  daily_price: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface RentalCheckoutData {
  drone: RentalDrone;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
}

interface RentalBooking {
  id: number;
  rental_drone_id: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface RentalsProps {
  onProceedToCheckout: (data: RentalCheckoutData) => void;
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

const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

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
  const current = new Date();
  return new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  );
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

function formatDate(value: string) {
  if (!value) return "لم يحدد";

  return parseDate(value).toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Rentals({
  onProceedToCheckout,
}: RentalsProps) {
  const today = useMemo(() => getToday(), []);

  const [drones, setDrones] = useState<RentalDrone[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [selectedDrone, setSelectedDrone] =
    useState<RentalDrone | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [error, setError] = useState("");

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
      setError("تعذر تحميل درونات الإيجار");
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
    setError("");
    setVisibleMonth(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    setLoadingDates(true);

    const { data, error: datesError } = await supabase
      .from("rental_bookings")
      .select("id,rental_drone_id,start_date,end_date,status")
      .eq("rental_drone_id", drone.id)
      .in("status", BLOCKING_STATUSES);

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
        BLOCKING_STATUSES.includes(booking.status) &&
        value >= booking.start_date &&
        value <= booking.end_date,
    );
  }

  function isRangeAvailable(firstDate: string, lastDate: string) {
    return !bookings.some(
      (booking) =>
        BLOCKING_STATUSES.includes(booking.status) &&
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

    if (date < today || isDateBooked(value)) return;

    setError("");

    if (!startDate || (startDate && endDate && startDate !== endDate)) {
      setStartDate(value);
      setEndDate(value);
      return;
    }

    if (value <= startDate) {
      setStartDate(value);
      setEndDate(value);
      return;
    }

    if (!isRangeAvailable(startDate, value)) {
      setError("توجد أيام محجوزة داخل هذه المدة، اختر مدة أخرى");
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

    const minimumMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    if (nextMonth >= minimumMonth) {
      setVisibleMonth(nextMonth);
    }
  }

  const totalDays =
    startDate && endDate
      ? getRentalDays(startDate, endDate)
      : 0;

  const totalAmount = selectedDrone
    ? Number(selectedDrone.daily_price) * totalDays
    : 0;

  function proceedToCheckout() {
    if (!selectedDrone || !startDate || !endDate) {
      setError("اختر تاريخ الإيجار أولًا");
      return;
    }

    if (!isRangeAvailable(startDate, endDate)) {
      setError("هذه المدة لم تعد متاحة، اختر مدة أخرى");
      return;
    }

    onProceedToCheckout({
      drone: selectedDrone,
      startDate,
      endDate,
      totalDays,
      totalAmount,
    });

    setSelectedDrone(null);
  }

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-12 overflow-hidden rounded-[36px] bg-[#0F3A2B] px-6 py-14 text-center text-white shadow-2xl">
          <CalendarDays className="relative z-10 mx-auto mb-4 h-14 w-14 text-[#E5D8AA]" />

          <h1 className="relative z-10 text-4xl font-black md:text-5xl">
            تأجير درون
          </h1>

          <p className="relative z-10 mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
            اختر الدرون وحدد مدة الإيجار بكل سهولة ويسر.
          </p>
        </section>

        {error && !selectedDrone && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 font-bold text-[#0F3A2B]">
            <Loader2 className="h-7 w-7 animate-spin" />
            جاري تحميل الدرونات...
          </div>
        ) : drones.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#E7E2D3] p-12 text-center font-bold shadow-sm text-[#0F3A2B]">
            لا توجد درونات متاحة حاليًا
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {drones.map((drone) => (
              <article
                key={drone.id}
                className="overflow-hidden rounded-[32px] border border-[#E7E2D3] bg-white shadow-md transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-full bg-[#FAF8F5] relative overflow-hidden border-b border-[#F0EBE1]">
                    {drone.image_url ? (
                      <img
                        src={drone.image_url}
                        alt={drone.name}
                        className="w-full h-auto object-cover block transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-gray-400">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-7">
                    <h2 className="text-2xl font-black text-[#0F3A2B]">{drone.name}</h2>

                    <p className="mt-3 min-h-[52px] text-sm leading-7 text-gray-600">
                      {drone.description ||
                        "درون متاح للإيجار اليومي بكفاءة عالية."}
                    </p>
                  </div>
                </div>

                <div className="px-7 pb-7 pt-2">
                  <div className="flex items-end justify-between border-t border-[#F0EBE1] pt-5">
                    <div>
                      <p className="text-xs text-gray-400 font-bold mb-1">سعر اليوم</p>

                      <p className="text-2xl font-black text-[#0F3A2B]">
                        {Number(drone.daily_price).toFixed(3)} <span className="text-sm font-bold text-gray-500">ر.ع</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void openBooking(drone)}
                      className="rounded-2xl bg-[#0F3A2B] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#0F3A2B]/20 transition hover:bg-[#0c2e22] active:scale-95"
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
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center">
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[36px] border border-[#E7E2D3] bg-[#FDFBF7] shadow-2xl text-[#0F3A2B]">
            <div className="flex items-center justify-between border-b border-[#EFECE6] bg-white px-8 py-5">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">حجز درون</span>
                <h2 className="text-2xl font-black text-[#0F3A2B] mt-0.5">
                  {selectedDrone.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDrone(null)}
                className="rounded-full border border-[#EFECE6] bg-white p-3 text-gray-500 hover:text-[#0F3A2B] hover:bg-gray-50 transition shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-8 p-6 lg:grid-cols-[1fr_360px] items-start">
              <section className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0F3A2B]">
                      اختر مدة الإيجار
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      اضغط يومًا واحدًا لحجز يوم واحد، أو اختر يومًا ثانيًا لتحديد نهاية الحجز.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => moveMonth(-1)}
                      disabled={
                        visibleMonth.getFullYear() ===
                          today.getFullYear() &&
                        visibleMonth.getMonth() === today.getMonth()
                      }
                      className="rounded-xl bg-white p-2.5 text-[#0F3A2B] disabled:opacity-30 shadow-sm hover:bg-gray-50 transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <strong className="min-w-[140px] text-center text-sm font-black text-[#0F3A2B]">
                      {MONTHS[visibleMonth.getMonth()]}{" "}
                      {visibleMonth.getFullYear()}
                    </strong>

                    <button
                      type="button"
                      onClick={() => moveMonth(1)}
                      className="rounded-xl bg-white p-2.5 text-[#0F3A2B] shadow-sm hover:bg-gray-50 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {loadingDates ? (
                  <div className="flex justify-center py-24 text-[#0F3A2B]">
                    <Loader2 className="animate-spin h-8 w-8" />
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
                        const past = date < today;
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
                                ? "bg-red-50 text-red-300 border-red-100 line-through cursor-not-allowed"
                                : past
                                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                  : selected
                                    ? "bg-[#0F3A2B] text-white border-[#0F3A2B] shadow-lg shadow-[#0F3A2B]/20 scale-105 z-10"
                                    : insideRange
                                      ? "bg-[#F2ECE0] text-[#0F3A2B] border-[#E8DFCC]"
                                      : "bg-white text-[#0F3A2B] border-[#EFECE6] hover:border-[#0F3A2B] hover:shadow-md"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-6 text-xs font-bold text-gray-500 pt-4 border-t border-[#F0EBE1]">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0F3A2B]"></span>
                        <span>اختيارك</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                        <span>محجوز</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-100"></span>
                        <span>غير متاح</span>
                      </div>
                    </div>
                  </>
                )}
              </section>

              <aside className="space-y-6">
                <div className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm">
                  <h3 className="text-2xl font-black text-[#0F3A2B]">
                    {selectedDrone.name}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EFECE6]">
                      <span className="text-xs text-gray-400 font-bold block mb-1">
                        الإيجار اليومي
                      </span>
                      <p className="text-lg font-black text-[#0F3A2B]">
                        {Number(
                          selectedDrone.daily_price,
                        ).toFixed(3)}{" "}
                        ر.ع
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EFECE6]">
                      <span className="text-xs text-gray-400 font-bold block mb-1">
                        مبلغ التأمين
                      </span>
                      <p className="text-lg font-black text-[#0F3A2B]">
                        {Number(
                          selectedDrone.deposit_amount || 0,
                        ).toFixed(3)}{" "}
                        ر.ع
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-[#EFECE6] bg-white p-7 shadow-sm">
                  <h3 className="mb-5 text-xl font-black text-[#0F3A2B]">
                    ملخص الحجز
                  </h3>

                  <div className="space-y-3 rounded-2xl bg-[#FAF8F5] p-5 border border-[#EFECE6] text-sm">
                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>من</span>
                      <b className="text-[#0F3A2B]">{formatDate(startDate)}</b>
                    </div>

                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>إلى</span>
                      <b className="text-[#0F3A2B]">{formatDate(endDate)}</b>
                    </div>

                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>عدد الأيام</span>
                      <b className="text-[#0F3A2B]">{totalDays} يوم</b>
                    </div>

                    <div className="flex justify-between gap-3 border-t border-gray-200/80 pt-4 text-lg">
                      <span className="font-bold text-gray-700">الإجمالي</span>
                      <b className="text-xl font-black text-[#0F3A2B]">{totalAmount.toFixed(3)} ر.ع</b>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!startDate || !endDate}
                    onClick={proceedToCheckout}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0F3A2B] font-black text-white shadow-xl shadow-[#0F3A2B]/20 transition hover:bg-[#0c2e22] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    الانتقال إلى الدفع
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
