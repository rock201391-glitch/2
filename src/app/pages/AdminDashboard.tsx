import { useEffect, useState } from "react";
import { Menu, X, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import OrdersTab from "../components/admin/OrdersTab";
import ProductsManager from "../components/admin/ProductsManager";
import AuctionsManager from "../components/admin/AuctionsManager";
import CategoriesManager from "../components/admin/CategoriesManager";
import DiscountCodesManager from "../components/admin/DiscountCodesManager";
import ShippingManager from "../components/admin/ShippingManager";
import SettingsManager from "../components/admin/SettingsManager";
import ThemeManager from "../components/admin/ThemeManager";
import WorkshopRequestsManager from "../components/admin/WorkshopRequestsManager";

type AdminTab =
  | "orders"
  | "products"
  | "auctions"
  | "categories"
  | "discounts"
  | "shipping"
  | "settings"
  | "theme"
  | "workshop";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "orders",     label: "الطلبات الملكية" },
  { id: "products",   label: "إدارة المنتجات" },
  { id: "auctions",   label: "المزادات الحية" },
  { id: "categories", label: "الأقسام والتصنيفات" },
  { id: "discounts",  label: "كوبونات الخصم" },
  { id: "shipping",   label: "شركات الشحن" },
  { id: "settings",   label: "إعدادات البنك" },
  { id: "theme",      label: "هوية الثيم" },
  { id: "workshop",   label: "طلبات الورشة" },
];

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      setLoginError("بيانات الاعتماد غير مطابقة للأرشيف الملكي");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    window.location.reload();
  };

  // ── شاشة تسجيل الدخول الملكية الفاخرة ────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#071F17] flex flex-col items-center justify-center px-4 text-[#F8F7F2] relative overflow-hidden" dir="rtl">
        {/* تأثيرات الإضاءة الفضائية والخلفية الفاخرة */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0F3A2B] rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D8C99B]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#0B2E22]/80 backdrop-blur-2xl rounded-[36px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-[#D8C99B]/20 text-center relative z-10">
          
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D8C99B] to-[#B8A774] text-[#0F3A2B] shadow-lg shadow-[#D8C99B]/10">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-black tracking-wider text-[#F8F7F2] font-serif">مِرقاب</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="h-3.5 w-3.5 text-[#D8C99B]" />
              <p className="text-[11px] text-[#D8C99B] tracking-[0.25em] uppercase font-semibold">بوابة الإدارة العليا</p>
              <Sparkles className="h-3.5 w-3.5 text-[#D8C99B]" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-right">
            <div>
              <label className="block text-xs font-bold mb-2 mr-2 text-[#D8C99B] tracking-wide">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full rounded-2xl border border-[#D8C99B]/30 bg-[#071F17]/70 px-5 py-4 text-[#F8F7F2] outline-none focus:border-[#D8C99B] focus:ring-4 focus:ring-[#D8C99B]/10 transition-all text-left font-mono text-sm placeholder:text-[#6E7F76]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 mr-2 text-[#D8C99B] tracking-wide">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-[#D8C99B]/30 bg-[#071F17]/70 px-5 py-4 text-[#F8F7F2] outline-none focus:border-[#D8C99B] focus:ring-4 focus:ring-[#D8C99B]/10 transition-all text-left font-mono text-sm placeholder:text-[#6E7F76]"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-400 text-xs font-semibold text-center mt-3 bg-red-950/40 py-3 px-4 rounded-2xl border border-red-900/50 backdrop-blur-md">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-4 rounded-2xl bg-gradient-to-r from-[#D8C99B] to-[#C5B484] py-4 text-[#0F3A2B] font-black text-base hover:opacity-95 shadow-[0_10px_25px_-5px_rgba(216,201,155,0.3)] transition-all active:scale-[0.98]"
            >
              دخول إلى لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── لوحة التحكم الرئيسية بتصميم فضاء فاخر وأخضر ملكي ────────────────────────
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b3124] via-[#071f17] to-[#04120e] text-[#F8F7F2] flex flex-col selection:bg-[#D8C99B] selection:text-[#0F3A2B]" dir="rtl">
      
      {/* شريط علوي زجاجي فاخر */}
      <header className="sticky top-0 z-40 bg-[#0F3A2B]/80 backdrop-blur-xl border-b border-[#D8C99B]/15 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D8C99B]/20 bg-white/5 text-[#D8C99B] hover:bg-white/10 transition-all"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-wider font-serif bg-gradient-to-r from-[#F8F7F2] via-[#F8F7F2] to-[#D8C99B] bg-clip-text text-transparent">مِرقاب</h1>
            <span className="text-[11px] bg-[#D8C99B]/15 border border-[#D8C99B]/30 px-3.5 py-1 rounded-full font-bold text-[#D8C99B] tracking-wider hidden sm:inline-block">
              المركز الملكي للإدارة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-2xl font-semibold backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-gray-300">المسؤول:</span>
            <span className="text-[#D8C99B] font-mono">ro0ak</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-red-950/30 border border-red-500/30 px-5 py-2.5 font-bold hover:bg-red-900/40 transition-all text-xs text-red-300 shadow-lg shadow-red-950/20 active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج آمن</span>
          </button>
        </div>
      </header>

      {/* الجسم الرئيسي: الشريط الجانبي والمحتوى */}
      <div className="flex flex-1 relative">
        
        {/* الشريط الجانبي لسطح المكتب (فاخر وزجاجي) */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-[#071F17]/60 backdrop-blur-2xl border-l border-[#D8C99B]/10 shadow-[5px_0_30px_rgba(0,0,0,0.3)] flex-col py-8 gap-2 px-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D8C99B]/70">أقسام الإدارة</p>
          </div>
          
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-right rounded-2xl px-5 py-3.5 font-bold text-sm transition-all flex items-center justify-between group ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#D8C99B] to-[#C5B484] text-[#0F3A2B] shadow-[0_10px_20px_-5px_rgba(216,201,155,0.3)] translate-x-[-4px]"
                  : "text-gray-300 hover:bg-white/5 hover:text-[#D8C99B]"
              }`}
            >
              <span>{tab.label}</span>
              <div className={`h-1.5 w-1.5 rounded-full transition-all ${activeTab === tab.id ? "bg-[#0F3A2B]" : "bg-transparent group-hover:bg-[#D8C99B]/50"}`} />
            </button>
          ))}
        </aside>

        {/* الشريط الجانبي للجوال (Drawer) */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm transition-opacity"
              aria-label="إغلاق القائمة"
            />

            <aside className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#09271E] border-l border-[#D8C99B]/20 px-5 py-6 shadow-2xl overflow-y-auto z-10 flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D8C99B] text-[#0F3A2B] flex items-center justify-center font-bold">م</div>
                  <h2 className="text-xl font-bold font-serif text-[#F8F7F2]">لوحة التحكم</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D8C99B] hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-right rounded-2xl px-5 py-4 font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#D8C99B] to-[#C5B484] text-[#0F3A2B] shadow-lg"
                        : "text-gray-300 hover:bg-white/5 hover:text-[#D8C99B]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-[#D8C99B]/60 font-mono">متجر مِرقاب النسخة الملكية 2026</p>
              </div>
            </aside>
          </div>
        )}

        {/* المحتوى الرئيسي للمدير (بإطار زجاجي راقي جداً) */}
        <main className="min-w-0 flex-1 px-4 sm:px-8 py-6 lg:py-8">
          <div className="w-full min-w-0 bg-[#09271E]/40 backdrop-blur-md rounded-[32px] border border-[#D8C99B]/15 p-4 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-x-auto">
            {activeTab === "orders"     && <OrdersTab />}
            {activeTab === "products"   && <ProductsManager />}
            {activeTab === "auctions"   && <AuctionsManager />}
            {activeTab === "categories" && <CategoriesManager />}
            {activeTab === "discounts"  && <DiscountCodesManager />}
            {activeTab === "shipping"   && <ShippingManager />}
            {activeTab === "settings"   && <SettingsManager />}
            {activeTab === "theme"      && <ThemeManager />}
            {activeTab === "workshop"   && <WorkshopRequestsManager />}
          </div>
        </main>

      </div>
    </div>
  );
}
