import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  return (
    <div className="min-h-screen bg-[#F8F7F2] px-6 py-10 text-[#0F3A2B]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">لوحة الطلبات</h1>

          <button
            onClick={fetchOrders}
            className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white font-semibold"
          >
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            جاري تحميل الطلبات...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            لا توجد طلبات حالياً
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-xl border border-[#D8D2C5]">
            <table className="w-full text-right">
              <thead className="bg-[#0F3A2B] text-white">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">الإجمالي</th>
                  <th className="p-4">المنطقة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">التفاصيل</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#E8E3D9] hover:bg-[#F8F7F2]">
                    <td className="p-4 font-bold">{order.id}</td>
                    <td className="p-4">{order.customer_name || "-"}</td>
                    <td className="p-4" dir="ltr">{order.phone || "-"}</td>
                    <td className="p-4">{order.product_name || "-"}</td>
                    <td className="p-4 font-bold">{order.total || 0} ر.ع</td>
                    <td className="p-4">
                      {order.governorate || "-"} / {order.city || "-"}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-[#EAF3EE] px-4 py-1 text-sm font-bold">
                        {order.payment_status || "pending"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("ar")
                        : "-"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-full bg-[#0F3A2B] px-4 py-2 text-white text-sm"
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

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full text-[#0F3A2B]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">تفاصيل الطلب #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><b>الاسم:</b> {selectedOrder.customer_name || "-"}</p>
                <p><b>الهاتف:</b> {selectedOrder.phone || "-"}</p>
                <p><b>المنتج:</b> {selectedOrder.product_name || "-"}</p>
                <p><b>الإجمالي:</b> {selectedOrder.total || 0} ر.ع</p>
                <p><b>المحافظة:</b> {selectedOrder.governorate || "-"}</p>
                <p><b>الولاية:</b> {selectedOrder.city || "-"}</p>
                <p><b>طريقة التوصيل:</b> {selectedOrder.shipping_method || "-"}</p>
                <p><b>الحالة:</b> {selectedOrder.payment_status || "pending"}</p>
                <p className="md:col-span-2">
                  <b>الإيصال:</b> {selectedOrder.receipt_url || "-"}
                </p>
                <p className="md:col-span-2">
                  <b>الملاحظات:</b> {selectedOrder.notes || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
