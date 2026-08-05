import { useEffect, useState } from "react";
import {
  Check,
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

interface Order {
  id: number | string;
  customer_name?: string | null;
  phone?: string | null;
  product_name?: string | null;
  total?: number | null;
  status?: string | null;
  created_at: string;
}

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

function normalizeStatus(status?: string | null) {
  return (status || "قيد المراجعة").trim();
}

function isCancelledStatus(status?: string | null) {
  return CANCELLED_STATUSES.includes(normalizeStatus(status).toLowerCase());
}

function getStatusStyle(status?: string | null) {
  const currentStatus = normalizeStatus(status);

  if (isCancelledStatus(currentStatus)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  switch (currentStatus) {
    case "قيد المراجعة":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "تم تأكيد الطلب":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "جاري التحضير":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "قيد التوصيل":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "تم الاستلام":
      return "border-green-200 bg-green-50 text-green-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchOrdersByPhone(phoneNumber: string) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
      setMessage("اكتب رقم الهاتف");
      setOrders([]);
      setSearched(false);
      return;
    }

    if (normalizedPhone.length < 8) {
      setMessage("رقم الهاتف يجب أن يكون 8 أرقام على الأقل");
      setOrders([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setSearched(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(buildPhoneSearchFilter(normalizedPhone))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders error:", error);
      setMessage("حدث خطأ أثناء البحث عن الطلبات");
      setOrders([]);
    } else {
      setOrders((data as Order[]) || []);
      setSearchedPhone(phoneNumber);
    }

    setLoading(false);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    void fetchOrdersByPhone(phone);
  }

  useEffect(() => {
    if (!searchedPhone) return;

    const channel = supabase
      .channel("customer-orders-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          void fetchOrdersByPhone(searchedPhone);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [searchedPhone]);

  return (
    <div
      className="min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 rounded-3xl bg-[#0F3A2B] px-6 py-10 text-center text-white md:px-12">
          <h1 className="mb-3 text-4xl font-bold">مشترياتي</h1>

          <p className="text-sm text-white/85 md:text-base">
            أدخل رقم الهاتف المستخدم عند الطلب لعرض جميع طلباتك ومراحل التوصيل
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
        ) : searched && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
              <ShoppingBag className="mx-auto mb-5 h-12 w-12" />

              <h2 className="mb-3 text-2xl font-bold">
                لا توجد طلبات بهذا الرقم
              </h2>

              <p className="mb-6 text-sm text-gray-500">
                تأكد أنك كتبت نفس رقم الهاتف المستخدم عند تقديم الطلب.
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
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#E5E1D8] bg-white px-5 py-4 text-sm font-bold shadow-sm">
              تم العثور على {orders.length} طلب
            </div>

            {orders.map((order) => {
              const currentStatus = normalizeStatus(order.status);
              const currentIndex = STATUS_ORDER.indexOf(currentStatus);
              const cancelled = isCancelledStatus(currentStatus);

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#E5E1D8] bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-6 grid grid-cols-2 gap-5 border-b border-[#ECE8DF] pb-6 md:grid-cols-4">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">رقم الطلب</p>
                      <p className="font-bold">#{order.id}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm text-gray-500">التاريخ</p>
                      <p className="font-bold">
                        {new Date(order.created_at).toLocaleDateString("ar-OM")}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-gray-500">الحالة</p>
                      <span
                        className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
                          currentStatus,
                        )}`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <div>
                      <p className="mb-1 text-sm text-gray-500">الإجمالي</p>
                      <p className="text-xl font-bold">
                        {Number(order.total || 0).toFixed(3)} ر.ع
                      </p>
                    </div>
                  </div>

                  <div className="border-b border-[#ECE8DF] pb-6">
                    <h2 className="mb-3 font-bold">تفاصيل الطلب والعميل</h2>

                    <p className="text-sm leading-7 text-gray-700">
                      اسم العميل:{" "}
                      <span className="font-semibold text-[#0F3A2B]">
                        {order.customer_name || "غير متوفر"}
                      </span>
                    </p>

                    <p className="text-sm leading-7 text-gray-700">
                      المنتج:{" "}
                      <span className="font-semibold text-[#0F3A2B]">
                        {order.product_name || "لا توجد تفاصيل للمنتجات"}
                      </span>
                    </p>
                  </div>

                  <div className="pt-6">
                    <h3 className="mb-6 font-bold">مراحل الطلب</h3>

                    {cancelled ? (
                      <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                          <X className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-bold text-red-700">
                            تم إلغاء الطلب
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            تم إلغاء هذا الطلب ولن يتم إكمال مراحل التوصيل.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {ORDER_STEPS.map((label, index) => {
                          const stepStatusIndex = STATUS_ORDER.indexOf(label);
                          const completed =
                            currentIndex >= stepStatusIndex &&
                            currentIndex !== -1;

                          return (
                            <div
                              key={label}
                              className="flex items-start gap-4"
                            >
                              <div
                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                  completed
                                    ? "bg-[#0F3A2B] text-white"
                                    : "bg-[#E8E3D9] text-white/90"
                                }`}
                              >
                                {completed ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  index + 1
                                )}
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
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
