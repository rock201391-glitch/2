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

    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        لوحة الطلبات
      </h1>

      {loading ? (

        <p>جاري التحميل...</p>

      ) : (

        <table className="w-full border">

          <thead>

            <tr>

              <th>ID</th>

              <th>الاسم</th>

              <th>الهاتف</th>

              <th>الإجمالي</th>

              <th>الحالة</th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr key={order.id}>

                <td>{order.id}</td>

                <td>{order.customer_name}</td>

                <td>{order.phone}</td>

                <td>{order.total}</td>

                <td>{order.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}
