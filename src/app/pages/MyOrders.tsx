import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Phone,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface MyOrdersProps {
  onNavigate: (page: string) => void;
}

interface StoreOrder {
  id: number | string;
  customer_name?: string | null;
  phone?: string | null;
  product_name?: string | null;
  total?: number | null;
  status?: string | null;
  created_at: string;
  type: "store";
}

interface RentalBooking {
  id: number | string;
  customer_name?: string | null;
  phone?: string | null;
  governorate?: string | null;
  wilayat?: string | null;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: string;
  created_at: string;
  rental_drones?: {
    name?: string | null;
  } | null;
  type: "rental";
}

type CustomerItem = StoreOrder | RentalBooking;

const ORDER_STEPS = [
  "تم تأكيد الطلب",
  "جاري التحضير",
  "قيد التوصيل",
  "تم الاستلام",
];

const STATUS_ORDER = [
  "قيد المراجعة",
  "تم تأكيد الطلب",
  "جاري التحضير",
  "قيد التوصيل",
  "تم الاستلام",
];

const RENTAL_STEPS = [
  "قيد المراجعة",
  "مؤكد",
  "قيد الإيجار",
  "مكتمل",
];

const RENTAL_STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  active: "قيد الإيجار",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const CANCELLED_STATUSES = [
  "ملغي",
  "ملغى",
  "ملغية",
  "تم الإلغاء",
  "تم الالغاء",
  "تم إلغاء الطلب",
  "تم الغاء الطلب",
  "cancelled",
  "canceled",
];

function normalizePhoneNumber(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/\D/g, "");
}

function toArabicDigits(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
}

function toPersianDigits(value: string) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function buildPhoneSearchFilter(value: string) {
  const normalizedPhone = normalizePhoneNumber(value);

  const phoneWithout968 = normalizedPhone.startsWith("968")
    ? normalizedPhone.slice(3)
    : normalizedPhone;

  const phoneWith968 = normalizedPhone.startsWith("968")
    ? normalizedPhone
    : `968${normalizedPhone}`;

  const variants = [
    phoneWithout968,
    phoneWith968,
    `+${phoneWith968}`,
    toArabicDigits(phoneWithout968),
    toArabicDigits(phoneWith968),
    `+${toArabicDigits(phoneWith968)}`,
    toPersianDigits(phoneWithout968),
    toPersianDigits(phoneWith968),
    `+${toPersianDigits(phoneWith968)}`,
  ];

  return [...new Set(variants)]
    .map((number) => `phone.eq.${number}`)
    .join(",");
}

function normalizeStoreStatus(status?: string | null) {
  return (status || "قيد المراجعة").trim();
}

function normalizeRentalStatus(status?: string | null) {
  const raw = (status || "pending").trim();
  return RENTAL_STATUS_LABELS[raw] || raw;
}

function isCancelledStatus(status?: string | null) {
  return CANCELLED_STATUSES.includes((status || "").trim().toLowerCase());
}

function getStatusStyle(status?: string | null) {
  const currentStatus = (status || "").trim();

  if (isCancelledStatus(currentStatus)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  switch (currentStatus) {
    case "قيد المراجعة":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "تم تأكيد الطلب":
    case "مؤكد":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "جاري التحضير":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "قيد التوصيل":
    case "قيد الإيجار":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "تم الاستلام":
    case "مكتمل":
      return "border-green-200 bg-green-50 text-green-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
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

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [items, setItems] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchCustomerItems(phoneNumber: string) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
      setMessage("اكتب رقم الهاتف");
      setItems([]);
      setSearched(false);
      return;
    }

    if (normalizedPhone.length < 8) {
      setMessage("رقم الهاتف يجب أن يكون 8 أرقام على الأقل");
      setItems([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setSearched(true);

    const phoneFilter = buildPhoneSearchFilter(normalizedPhone);

    const [ordersResult, rentalsResult] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .or(phoneFilter)
        .order("created_at", { ascending: false }),

      supabase
        .from("rental_bookings")
        .select("*, rental_drones(name)")
        .or(phoneFilter)
        .order("created_at", { ascending: false }),
    ]);

    if (ordersResult.error || rentalsResult.error) {
      console.error(
        "Fetch customer items error:",
        ordersResult.error || rentalsResult.error,
      );

      setMessage("حدث خطأ أثناء البحث عن الطلبات");
      setItems([]);
    } else {
      const storeOrders: StoreOrder[] = (
        (ordersResult.data as Omit<StoreOrder, "type">[]) || []
      ).map((order) => ({
        ...order,
        type: "store",
      }));

      const rentalBookings: RentalBooking[] = (
        (rentalsResult.data as Omit<RentalBooking, "type">[]) || []
      ).map((booking) => ({
        ...booking,
        type: "rental",
      }));

      const combinedItems: CustomerItem[] = [
        ...storeOrders,
        ...rentalBookings,
      ].sort(
        (first, second) =>
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime(),
      );

      setItems(combinedItems);
      setSearchedPhone(phoneNumber);
    }

    setLoading(false);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    void fetchCustomerItems(phone);
  }

  useEffect(() => {
    if (!searchedPhone) return;

    const ordersChannel = supabase
      .channel("customer-store-orders-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void fetchCustomerItems(searchedPhone);
        },
      )
      .subscribe();

    const rentalsChannel = supabase
      .channel("customer-rental-bookings-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rental_bookings",
        },
        () => {
          void fetchCustomerItems(searchedPhone);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ordersChannel);
      void supabase.removeChannel(rentalsChannel);
    };
  }, [searchedPhone]);

  const totals = useMemo(() => {
    return {
      storeOrders: items.filter((item) => item.type === "store").length,
      rentals: items.filter((item) => item.type === "rental").length,
    };
  }, [items]);

  return (
    <div
      className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 rounded-3xl bg-[#0F3A2B] px-6 py-10 text-center text-white md:px-12">
          <h1 className="mb-3 text-4xl font-bold">مشترياتي</h1>

          <p className="text-sm text-white/85 md:text-base">
            أدخل رقم الهاتف المستخدم لعرض طلبات المتجر وحجوزات تأجير الدرونات
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-10 rounded-3xl border border-[#E5E1D8] bg-white p-5 shadow-sm md:p-8"
        >
          <label className="mb-3 block text-sm font-bold">رقم الهاتف</label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div
              className="flex flex-1 items-center gap-3 rounded-full border border-[#D8D2C5] bg-[#F8F7F2] px-5"
              dir="ltr"
            >
              <Phone className="h-5 w-5 text-[#0F3A2B]" />

              <input
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(normalizePhoneNumber(event.target.value));
                  setMessage("");
                }}
                placeholder="968XXXXXXXX"
                className="w-full bg-transparent py-4 text-left text-[#0F3A2B] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-[#0F3A2B] px-8 py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  بحث
                </>
              )}
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">
              {message}
            </div>
          )}
        </form>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 font-bold">
            <Loader2 className="h-6 w-6 animate-spin" />
            جاري تحميل الطلبات...
          </div>
        ) : searched && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
              <ShoppingBag className="mx-auto mb-5 h-12 w-12" />

              <h2 className="mb-3 text-2xl font-bold">
                لا توجد طلبات بهذا الرقم
              </h2>

              <p className="mb-6 text-sm text-gray-500">
                تأكد أنك كتبت نفس رقم الهاتف المستخدم في الشراء أو حجز الإيجار.
              </p>

              <button
                type="button"
                onClick={() => onNavigate("shop")}
                className="w-full rounded-full bg-[#0F3A2B] py-4 font-bold text-white"
              >
                تصفح المتجر
              </button>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E5E1D8] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-gray-500">إجمالي النتائج</p>
                <p className="mt-1 text-xl font-black">{items.length}</p>
              </div>

              <div className="rounded-2xl border border-[#E5E1D8] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-gray-500">طلبات المتجر</p>
                <p className="mt-1 text-xl font-black">
                  {totals.storeOrders}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E1D8] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-gray-500">حجوزات الإيجار</p>
                <p className="mt-1 text-xl font-black">
                  {totals.rentals}
                </p>
              </div>
            </div>

            {items.map((item) =>
              item.type === "store" ? (
                <StoreOrderCard key={`store-${item.id}`} order={item} />
              ) : (
                <RentalBookingCard
                  key={`rental-${item.id}`}
                  booking={item}
                />
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StoreOrderCard({ order }: { order: StoreOrder }) {
  const currentStatus = normalizeStoreStatus(order.status);
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const cancelled = isCancelledStatus(currentStatus);

  return (
    <div className="rounded-3xl border border-[#E5E1D8] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs text-gray-500">نوع الطلب</p>
            <h2 className="font-black">شراء من المتجر</h2>
          </div>
        </div>

        <span
          className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
            currentStatus,
          )}`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-5 border-b border-[#ECE8DF] pb-6 md:grid-cols-4">
        <Info label="رقم الطلب" value={`#${order.id}`} />
        <Info
          label="التاريخ"
          value={new Date(order.created_at).toLocaleDateString("ar-OM")}
        />
        <Info
          label="المنتج"
          value={order.product_name || "لا توجد تفاصيل"}
        />
        <Info
          label="الإجمالي"
          value={`${Number(order.total || 0).toFixed(3)} ر.ع`}
          large
        />
      </div>

      <div className="border-b border-[#ECE8DF] pb-6">
        <h3 className="mb-3 font-bold">تفاصيل العميل</h3>
        <p className="text-sm leading-7 text-gray-700">
          اسم العميل:{" "}
          <span className="font-semibold text-[#0F3A2B]">
            {order.customer_name || "غير متوفر"}
          </span>
        </p>
      </div>

      <div className="pt-6">
        <h3 className="mb-6 font-bold">مراحل الطلب</h3>

        {cancelled ? (
          <CancelledMessage text="تم إلغاء هذا الطلب ولن يتم إكمال مراحل التوصيل." />
        ) : (
          <div className="space-y-5">
            {ORDER_STEPS.map((label, index) => {
              const stepStatusIndex = STATUS_ORDER.indexOf(label);
              const completed =
                currentIndex >= stepStatusIndex && currentIndex !== -1;

              return (
                <ProgressStep
                  key={label}
                  label={label}
                  number={index + 1}
                  completed={completed}
                />
              );
            })}

            {currentStatus === "قيد المراجعة" && (
              <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                طلبك قيد المراجعة، وسيتم تحديث الحالة بعد تأكيده.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RentalBookingCard({
  booking,
}: {
  booking: RentalBooking;
}) {
  const currentStatus = normalizeRentalStatus(booking.status);
  const currentIndex = RENTAL_STEPS.indexOf(currentStatus);
  const cancelled = isCancelledStatus(currentStatus);

  const rentalPeriod =
    booking.total_days === 1 || booking.start_date === booking.end_date
      ? formatDate(booking.start_date)
      : `${formatDate(booking.start_date)} إلى ${formatDate(
          booking.end_date,
        )}`;

  return (
    <div className="rounded-3xl border border-[#D9E4DF] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCE9E3] text-[#0F3A2B]">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs text-gray-500">نوع الطلب</p>
            <h2 className="font-black">استئجار درون</h2>
          </div>
        </div>

        <span
          className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
            currentStatus,
          )}`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-5 border-b border-[#ECE8DF] pb-6 md:grid-cols-4">
        <Info label="رقم الحجز" value={`#${booking.id}`} />
        <Info
          label="الدرون"
          value={booking.rental_drones?.name || "غير متوفر"}
        />
        <Info label="مدة الإيجار" value={rentalPeriod} />
        <Info
          label="الإجمالي"
          value={`${Number(booking.total_amount || 0).toFixed(3)} ر.ع`}
          large
        />
      </div>

      <div className="grid gap-3 border-b border-[#ECE8DF] pb-6 sm:grid-cols-2">
        <Info
          label="اسم المستأجر"
          value={booking.customer_name || "غير متوفر"}
        />
        <Info
          label="الموقع"
          value={
            booking.governorate || booking.wilayat
              ? `${booking.governorate || ""}${
                  booking.governorate && booking.wilayat ? " - " : ""
                }${booking.wilayat || ""}`
              : "غير متوفر"
          }
        />
        <Info
          label="عدد الأيام"
          value={
            booking.total_days === 1
              ? "يوم واحد"
              : `${booking.total_days} أيام`
          }
        />
        <Info
          label="تاريخ تقديم الحجز"
          value={new Date(booking.created_at).toLocaleDateString("ar-OM")}
        />
      </div>

      <div className="pt-6">
        <h3 className="mb-6 font-bold">مراحل حجز الإيجار</h3>

        {cancelled ? (
          <CancelledMessage text="تم إلغاء حجز الإيجار ولن يتم تسليم الدرون." />
        ) : (
          <div className="space-y-5">
            {RENTAL_STEPS.map((label, index) => {
              const completed =
                currentIndex >= index && currentIndex !== -1;

              return (
                <ProgressStep
                  key={label}
                  label={label}
                  number={index + 1}
                  completed={completed}
                  icon={index === 0 ? <Clock3 className="h-5 w-5" /> : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">{label}</p>
      <p className={large ? "text-xl font-bold" : "font-bold"}>
        {value}
      </p>
    </div>
  );
}

function ProgressStep({
  label,
  number,
  completed,
  icon,
}: {
  label: string;
  number: number;
  completed: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
          completed
            ? "bg-[#0F3A2B] text-white"
            : "bg-[#E8E3D9] text-white/90"
        }`}
      >
        {completed ? <Check className="h-5 w-5" /> : icon || number}
      </div>

      <div className="pt-2">
        <p className="font-semibold">{label}</p>

        {completed && (
          <p className="mt-1 text-sm text-gray-500">
            تم استكمال هذه المرحلة
          </p>
        )}
      </div>
    </div>
  );
}

function CancelledMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
        <X className="h-5 w-5" />
      </div>

      <div>
        <p className="font-bold text-red-700">تم الإلغاء</p>
        <p className="mt-1 text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}
