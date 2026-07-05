import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface Order {
  id: string | number;
  customer_name?: string;
  phone?: string;
  product_name?: string;
  total?: number;
  governorate?: string;
  city?: string;
  shipping_method?: string;
  payment_status?: string;
  notes?: string;
  receipt_url?: string;
  created_at?: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  async function handleUpdateStatus(orderId: string | number, newStatus: string) {
    setUpdatingStatus(true);

    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o)));
      setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newStatus } : prev));
    } else {
      alert("حدث خطأ أثناء تحديث حالة الطلب، يرجى المحاولة لاحقاً.");
    }
    setUpdatingStatus(false);
  }

  const getShippingText = (method?: string) => {
    if (method === "home") return "توصيل للمنزل";
    if (method === "office") return "استلام من المكتب";
    return method || "-";
  };

  return (
    <div>
      {/* شريط الأدوات العلوي */}
      <div className="mb-6 flex items-center justify-between flex-row-reverse">
        <h2 className="text-2xl font-bold">الطلبات</h2>
        <button
          onClick={fetchOrders}
          className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white font-semibold shadow hover:opacity-90 transition-all text-sm"
        >
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md border border-[#D8D2C5] text-lg font-medium">
          جاري تحميل الطلبات...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md border border-[#D8D2C5] text-lg font-medium">
          لا توجد طلبات حالياً
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-xl border border-[#D8D2C5]">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-5 font-bold text-sm">ID</th>
                <th className="p-5 font-bold text-sm">الاسم</th>
                <th className="p-5 font-bold text-sm">الهاتف</th>
                <th className="p-5 font-bold text-sm">المنتج</th>
                <th className="p-5 font-bold text-sm">الإجمالي</th>
                <th className="p-5 font-bold text-sm">المحافظة</th>
                <th className="p-5 font-bold text-sm">الولاية</th>
                <th className="p-5 font-bold text-sm">التوصيل</th>
                <th className="p-5 font-bold text-sm">الحالة</th>
                <th className="p-5 font-bold text-sm">التاريخ</th>
                <th className="p-5 font-bold text-sm">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#E8E3D9] hover:bg-[#F8F7F2]/60 transition-colors"
                >
                  <td className="p-5 font-bold">{order.id}</td>
                  <td className="p-5 font-medium">{order.customer_name || "-"}</td>
                  <td className="p-5 text-sm" dir="ltr">{order.phone || "-"}</td>
                  <td className="p-5 text-sm">{order.product_name || "-"}</td>
                  <td className="p-5 font-bold text-[#0F3A2B]">{order.total || 0} ر.ع</td>
                  <td className="p-5 text-sm">{order.governorate || "-"}</td>
                  <td className="p-5 text-sm">{order.city || "-"}</td>
                  <td className="p-5 text-sm">{getShippingText(order.shipping_method)}</td>
                  <td className="p-5">
                    <span className="rounded-full bg-[#EAF3EE] text-[#0F3A2B] px-4 py-1 text-xs font-bold shadow-sm border border-[#cbe2d5]">
                      {order.payment_status || "pending"}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-gray-400">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("ar")
                      : "-"}
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-full bg-[#0F3A2B] px-5 py-1.5 text-white text-xs font-semibold hover:opacity-90 shadow transition-all"
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة تفاصيل الطلب */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full text-[#0F3A2B] shadow-2xl relative border border-[#D8D2C5] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 left-6 text-2xl font-light hover:opacity-60 transition-opacity"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-right mb-6 pl-8">
              تفاصيل الطلب #{selectedOrder.id}
            </h2>

            <hr className="border-[#E8E3D9] mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-right text-sm mb-6" style={{ direction: "rtl" }}>
              <p><b>الاسم:</b> {selectedOrder.customer_name || "-"}</p>
              <p dir="ltr" className="text-right"><b>الهاتف:</b> {selectedOrder.phone || "-"}</p>
              <p><b>المنتج:</b> {selectedOrder.product_name || "-"}</p>
              <p><b>الإجمالي:</b> {selectedOrder.total || 0} ر.ع</p>
              <p><b>المحافظة:</b> {selectedOrder.governorate || "-"}</p>
              <p><b>الولاية:</b> {selectedOrder.city || "-"}</p>
              <p><b>طريقة التوصيل:</b> {getShippingText(selectedOrder.shipping_method)}</p>

              <div className="flex items-center gap-2">
                <b className="shrink-0">الحالة:</b>
                <select
                  value={selectedOrder.payment_status || "pending"}
                  disabled={updatingStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="rounded-xl border border-[#D8D2C5] bg-[#F8F7F2] px-3 py-1 text-[#0F3A2B] font-bold outline-none focus:border-[#0F3A2B] cursor-pointer text-xs shadow-sm transition-all"
                >
                  <option value="pending">pending</option>
                  <option value="قيد المراجعة">قيد المراجعة</option>
                  <option value="جاري التوصيل">جاري التوصيل</option>
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="ملغي">ملغي</option>
                </select>
              </div>

              <p className="sm:col-span-2">
                <b>الملاحظات:</b> {selectedOrder.notes || "مافي"}
              </p>
            </div>

            <hr className="border-[#E8E3D9] my-6" />

            <div className="text-right">
              <div className="flex justify-between items-center mb-4 flex-row-reverse">
                <h3 className="font-bold text-sm">صورة الإيصال</h3>
                {selectedOrder.receipt_url && (
                  <a
                    href={selectedOrder.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0F3A2B] px-4 py-1.5 text-white text-xs font-semibold hover:opacity-95 transition-all shadow"
                  >
                    فتح الصورة
                  </a>
                )}
              </div>

              {selectedOrder.receipt_url ? (
                <div className="rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] p-2 overflow-hidden flex justify-center items-center">
                  <img
                    src={selectedOrder.receipt_url}
                    alt="إيصال التحويل"
                    className="w-full max-h-[350px] object-contain rounded-xl"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">لا توجد صورة إيصال مرفقة لهذا الطلب</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
