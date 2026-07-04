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

  // التأكد من حالة تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInStatus = sessionStorage.getItem("adminLoggedIn");
      if (loggedInStatus === "true") {
        setIsLoggedIn(true);
      }
    }
  }, []);

 

  // جلب الطلبات من قاعدة البيانات
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

  // الدالة البرمجية لتحديث حالة الطلب مباشرة في السوبابيز (Supabase)
  async function handleUpdateStatus(orderId: any, newStatus: string) {
    setUpdatingStatus(true);
    
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      // تحديث الحالة فوراً في القائمة المحلية وفي النافذة المفتوحة
      setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
    } else {
      alert("حدث خطأ أثناء تحديث حالة الطلب، يرجى المحاولة لاحقاً.");
    }
    setUpdatingStatus(false);
  }

  // تسجيل الدخول الخاص بك
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

  // واجهة تسجيل الدخول الصافية
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

  // لوحة التحكم الرئيسية الصافية المتطابقة مع صورتك المرفقة
  return (
    <div className="min-h-screen bg-[#F8F7F2] px-6 py-10 text-[#0F3A2B]">
      <div className="max-w-7xl mx-auto">
        
        {/* شريط الإجراءات العلوي */}
        <div className="mb-8 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-4 flex-row-reverse">
            <h1 className="text-3xl font-bold">لوحة الطلبات</h1>
            <span className="text-sm bg-white border border-[#D8D2C5] px-4 py-1.5 rounded-full font-medium shadow-sm">
              مسؤول: ro0ak
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="rounded-full bg-[#0F3A2B] px-6 py-2 text-white font-semibold shadow hover:opacity-90 transition-all text-sm"
            >
              تحديث
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white border border-[#D8D2C5] px-6 py-2 font-semibold text-gray-600 shadow hover:bg-gray-50 transition-all text-sm"
            >
              خروج
            </button>
          </div>
        </div>

        {/* عرض القائمة أو الجداول */}
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

        {/* نافذة التفاصيل (Modal) المتطابقة مع صورتك مع زر التغيير */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full text-[#0F3A2B] shadow-2xl relative border border-[#D8D2C5] max-h-[90vh] overflow-y-auto">
              
              {/* زر الإغلاق الأنيق */}
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

              {/* شبكة البيانات النصية المعروضة في بطاقتك */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-right text-sm mb-6" style={{ direction: "rtl" }}>
                <p><b>الاسم:</b> {selectedOrder.customer_name || "-"}</p>
                <p dir="ltr" className="text-right"><b>الهاتف:</b> {selectedOrder.phone || "-"}</p>
                <p><b>المنتج:</b> {selectedOrder.product_name || "-"}</p>
                <p><b>الإجمالي:</b> {selectedOrder.total || 0} ر.ع</p>
                <p><b>المحافظة:</b> {selectedOrder.governorate || "-"}</p>
                <p><b>الولاية:</b> {selectedOrder.city || "-"}</p>
                <p><b>طريقة التوصيل:</b> {getShippingText(selectedOrder.shipping_method)}</p>
                
                {/* هنا تم تحويل حقل الحالة لقائمة تحكم مباشرة */}
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

              {/* قسم صورة الإيصال كما يظهر لديك */}
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
    </div>
  );
}
