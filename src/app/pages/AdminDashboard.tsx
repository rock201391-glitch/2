import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  // حالات التحقق من تسجيل الدخول
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // حالات لوحة التحكم بالطلبات
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // التأكد من حالة تسجيل الدخول عند فتح أو تحديث الصفحة باستخدام sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInStatus = sessionStorage.getItem("adminLoggedIn");
      if (loggedInStatus === "true") {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // كود برمي لإخفاء الهيدر والفوتر في المتجر عند عدم تسجيل الدخول
  useEffect(() => {
    const header = document.querySelector("header") || document.querySelector(".header") || document.querySelector("nav");
    const footer = document.querySelector("footer") || document.querySelector(".footer");

    if (!isLoggedIn) {
      if (header) (header as HTMLElement).style.display = "none";
      if (footer) (footer as HTMLElement).style.display = "none";
    } else {
      if (header) (header as HTMLElement).style.display = "none"; 
      if (footer) (footer as HTMLElement).style.display = "none";
    }

    return () => {
      if (header) (header as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
    };
  }, [isLoggedIn]);

  // جلب الطلبات فقط في حال كان المستخدم مسجلاً للدخول بنجاح
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  // دالة تحديث حالة الطلب في الـ Supabase
  async function handleUpdateStatus(orderId: any, newStatus: string) {
    setUpdatingStatus(true);
    
    // نقوم بتحديث الحقل في قاعدة البيانات (حسب اسم الحقل لديك، افتراضياً payment_status)
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      // تحديث الحالة محلياً في القائمة والنافذة المفتوحة دون الحاجة لإعادة تحميل الصفحة بالكامل
      setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
      alert("تم تحديث حالة الطلب بنجاح!");
    } else {
      alert("حدث خطأ أثناء تحديث الحالة، يرجى المحاولة لاحقاً.");
    }
    setUpdatingStatus(false);
  }

  // معالجة عملية تسجيل الدخول وحفظ الجلسة
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "ro0ak" && password === "99s551905") {
      sessionStorage.setItem("adminLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  // معالجة عملية تسجيل الخروج وحذف الجلسة
  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const getShippingText = (method: string) => {
    if (method === "home") return "توصيل للمنزل";
    if (method === "office") return "استلام من المكتب";
    return method || "-";
  };

  // 1. عرض صفحة تسجيل الدخول الصافية (بدون هيدر ولا فوتر)
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#F8F7F2] flex flex-col items-center justify-center px-4 text-[#0F3A2B]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-[#D8D2C5] text-center">
          
          <div className="mb-8">
            <h2 className="text-4xl font-bold tracking-wide text-[#0F3A2B]">مِرقاب</h2>
            <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">Admin Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-right">
            <div>
              <label className="block text-sm font-semibold mb-2 mr-1">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-left font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 mr-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-left font-mono"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-600 text-sm font-semibold text-center mt-2 bg-red-50 py-2 rounded-xl border border-red-100">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-4 rounded-2xl bg-[#0F3A2B] py-3 text-white font-bold text-lg hover:opacity-90 shadow-md transition-all"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. عرض لوحة التحكم الرئيسية الصافية بعد الدخول
  return (
    <div className="min-h-screen bg-[#F8F7F2] px-6 py-10 text-[#0F3A2B]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">لوحة الطلبات</h1>
            <span className="text-sm bg-white border border-[#D8D2C5] px-3 py-1 rounded-full font-medium">
              مسؤول: ro0ak
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white font-semibold shadow hover:opacity-90 transition-all"
            >
              تحديث
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white border border-[#D8D2C5] px-5 py-2 font-semibold text-gray-600 shadow hover:bg-gray-50 transition-all"
            >
              خروج
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow border border-[#D8D2C5]">
            جاري تحميل الطلبات...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow border border-[#D8D2C5]">
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
                  <th className="p-4">المحافظة</th>
                  <th className="p-4">الولاية</th>
                  <th className="p-4">التوصيل</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">التفاصيل</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E3D9] hover:bg-[#F8F7F2]"
                  >
                    <td className="p-4 font-bold">{order.id}</td>
                    <td className="p-4">{order.customer_name || "-"}</td>
                    <td className="p-4" dir="ltr">{order.phone || "-"}</td>
                    <td className="p-4">{order.product_name || "-"}</td>
                    <td className="p-4 font-bold">{order.total || 0} ر.ع</td>
                    <td className="p-4">{order.governorate || "-"}</td>
                    <td className="p-4">{order.city || "-"}</td>
                    <td className="p-4">{getShippingText(order.shipping_method)}</td>
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
            <div className="bg-white rounded-3xl p-8 max-w-3xl w-full text-[#0F3A2B] max-h-[90vh] overflow-y-auto border border-[#D8D2C5]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  تفاصيل الطلب #{selectedOrder.id}
                </h2>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* قسم التحكم وتعديل حالة الطلب */}
              <div className="mb-6 p-4 bg-[#F8F7F2] rounded-2xl border border-[#D8D2C5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-right">
                <div>
                  <h4 className="font-bold text-sm text-gray-500">التحكم بحالة الطلب:</h4>
                  <p className="text-xs text-gray-400 mt-1">الحالة التي تظهر للزبون في صفحة مشترياتي</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedOrder.payment_status || "pending"}
                    disabled={updatingStatus}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="rounded-xl border border-[#D8D2C5] bg-white px-3 py-2 text-[#0F3A2B] font-semibold outline-none focus:border-[#0F3A2B]"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="جاري التوصيل">جاري التوصيل</option>
                    <option value="تم التوصيل">تم التوصيل</option>
                    <option value="ملغي">ملغي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <p><b>الاسم:</b> {selectedOrder.customer_name || "-"}</p>
                <p><b>الهاتف:</b> {selectedOrder.phone || "-"}</p>
                <p><b>المنتج:</b> {selectedOrder.product_name || "-"}</p>
                <p><b>الإجمالي:</b> {selectedOrder.total || 0} ر.ع</p>
                <p><b>المحافظة:</b> {selectedOrder.governorate || "-"}</p>
                <p><b>الولاية:</b> {selectedOrder.city || "-"}</p>
                <p><b>طريقة التوصيل:</b> {getShippingText(selectedOrder.shipping_method)}</p>
                <p><b>الحالة الحالية:</b> <span className="font-bold underline">{selectedOrder.payment_status || "pending"}</span></p>
                <p className="md:col-span-2">
                  <b>الملاحظات:</b> {selectedOrder.notes || "-"}
                </p>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold mb-3">صورة الإيصال</h3>

                {selectedOrder.receipt_url ? (
                  <>
                    <a
                      href={selectedOrder.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mb-4 rounded-full bg-[#0F3A2B] px-5 py-2 text-white text-sm"
                    >
                      فتح الصورة
                    </a>

                    <img
                      src={selectedOrder.receipt_url}
                      alt="إيصال التحويل"
                      className="w-full max-h-[450px] object-contain rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2]"
                    />
                  </>
                ) : (
                  <p>لا توجد صورة إيصال</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
