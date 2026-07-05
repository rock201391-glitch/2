import { useEffect, useState } from "react";
import OrdersTab from "../components/admin/OrdersTab";
import ProductsManager from "../components/admin/ProductsManager";
import CategoriesManager from "../components/admin/CategoriesManager";

type AdminTab = "orders" | "products" | "categories";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "orders", label: "الطلبات" },
  { id: "products", label: "المنتجات" },
  { id: "categories", label: "الأقسام" },
];

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInStatus = sessionStorage.getItem("adminLoggedIn");
      if (loggedInStatus === "true") {
        setIsLoggedIn(true);
      }
    }
  }, []);

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

  // ── Login screen ────────────────────────────────────────────
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

  // ── Main dashboard with sidebar tabs ────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#0F3A2B] flex flex-col" dir="rtl">
      {/* Top bar */}
      <header className="bg-[#0F3A2B] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wide">مِرقاب</h1>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">لوحة التحكم</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-white/10 border border-white/20 px-3 py-1.5 rounded-full font-medium">
            مسؤول: ro0ak
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-white/10 border border-white/20 px-5 py-1.5 font-semibold hover:bg-white/20 transition-all text-sm"
          >
            خروج
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-l border-[#E8E3D9] shadow-sm flex flex-col py-6 gap-1 px-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-right rounded-2xl px-4 py-3 font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#0F3A2B] text-white shadow"
                  : "text-[#0F3A2B] hover:bg-[#EAF3EE]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 overflow-x-auto">
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "products" && <ProductsManager />}
          {activeTab === "categories" && <CategoriesManager />}
        </main>
      </div>
    </div>
  );
}
