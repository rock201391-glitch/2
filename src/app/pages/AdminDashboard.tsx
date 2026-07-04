import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] p-8 text-[#0E4F3A]">

      <h1 className="text-3xl font-bold mb-6">
        لوحة الطلبات
      </h1>

      {loading ? (

        <div className="text-center py-10">
          جاري تحميل الطلبات...
        </div>

      ) : (

        <div className="overflow-x-auto rounded-2xl shadow-lg">

          <table className="w-full bg-white rounded-2xl overflow-hidden border border-[#d9d2c4]">

            <thead className="bg-[#0E4F3A] text-white">

              <tr>

                <th className="p-4">ID</th>

                <th className="p-4">الاسم</th>

                <th className="p-4">الهاتف</th>

                <th className="p-4">الإجمالي</th>

                <th className="p-4">الحالة</th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                  className="border-b hover:bg-[#f5f2ea] transition"
                >

                  <td className="p-4">
                    {order.id}
                  </td>

                  <td className="p-4">
                    {order.customer_name}
                  </td>

                  <td className="p-4">
                    {order.phone}
                  </td>

                  <td className="p-4 font-semibold">
                    {order.total}
                  </td>

                  <td className="p-4">

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">

                      {order.payment_status}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}
