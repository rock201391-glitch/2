import { useEffect, useState } from "react";
import { Loader2, Phone, Search, ShoppingBag } from "lucide-react";
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

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchOrdersByPhone(phoneNumber: string) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (!cleanPhone) {
      setMessage("اكتب رقم الهاتف");
      setOrders([]);
      return;
    }

    if (cleanPhone.length < 8) {
      setMessage("رقم الهاتف يجب أن يكون 8 أرقام على الأقل");
      setOrders([]);
      return;
    }

    setLoading(true);
    setMessage("");
    setSearched(true);

    const lastEightDigits = cleanPhone.replace(/^968/, "").slice(-8);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders error:", error);
      setMessage("حدث خطأ أثناء البحث عن الطلبات");
      setOrders([]);
    } else {
      const matchingOrders = ((data as Order[]) || []).filter((order) => {
        const savedPhone = String(order.phone || "")
          .replace(/\D/g, "")
          .replace(/^968/, "");

        return savedPhone.slice(-8) === lastEightDigits;
      });

      setOrders(matchingOrders);
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
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center text-4xl font-bold">مشترياتي</h1>

        <p className="mb-10 text-center text-sm text-gray-600">
          أدخل رقم الهاتف المستخدم عند الطلب لعرض جميع طلباتك
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mb-10 max-w-2xl rounded-3xl bg-white p-5 shadow-sm"
        >
          <label className="mb-2 block text-sm font-bold">رقم الهاتف</label>

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
                  setPhone(event.target.value);
                  setMessage("");
                }}
                placeholder="968XXXXXXXX"
                className="w-full bg-transparent py-4 text-left outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-[#0F3A2B] px-8 py-4 font-bold text-white disabled:opacity-60"
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
            <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center">
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
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
              >
                <div className="mb-6 grid grid-cols-1 gap-5 border-b pb-6 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-600">رقم الطلب</p>
                    <p className="font-bold">#{order.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">التاريخ</p>
                    <p className="font-bold">
                      {new Date(order.created_at).toLocaleDateString("ar-OM")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">الحالة</p>
                    <span className="mt-1 inline-block rounded-full bg-[#FFF3E0] px-4 py-2 text-sm font-semibold text-[#E65100]">
                      {order.status || "قيد المراجعة"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">الإجمالي</p>
                    <p className="text-xl font-bold">
                      {Number(order.total || 0).toFixed(3)} ر.ع
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="mb-2 font-bold">المنتجات:</p>
                  <p>{order.product_name || "لا توجد تفاصيل للمنتجات"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
