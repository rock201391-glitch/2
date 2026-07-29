import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  Package,
  Gavel,
  Layers3,
  TicketPercent,
  Truck,
  Landmark,
  Palette,
  Wrench,
  LogOut,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

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

type TabItem = {
  id: AdminTab;
  label: string;
  description: string;
  icon: React.ElementType;
};

const TABS: TabItem[] = [
  {
    id: "orders",
    label: "الطلبات",
    description: "إدارة ومتابعة طلبات العملاء",
    icon: ShoppingBag,
  },
  {
    id: "products",
    label: "المنتجات",
    description: "الأسعار والمخزون والمنتجات",
    icon: Package,
  },
  {
    id: "auctions",
    label: "المزادات",
    description: "إنشاء وإدارة المزادات",
    icon: Gavel,
  },
  {
    id: "categories",
    label: "الأقسام والتصنيفات",
    description: "ترتيب أقسام المتجر",
    icon: Layers3,
  },
  {
    id: "discounts",
    label: "كوبونات الخصم",
    description: "إدارة العروض والكوبونات",
    icon: TicketPercent,
  },
  {
    id: "shipping",
    label: "شركات الشحن",
    description: "خيارات وأسعار التوصيل",
    icon: Truck,
  },
  {
    id: "settings",
    label: "إعدادات البنك",
    description: "بيانات التحويل والدفع",
    icon: Landmark,
  },
  {
    id: "theme",
    label: "هوية المتجر",
    description: "ألوان وبنرات المتجر",
    icon: Palette,
  },
  {
    id: "workshop",
    label: "طلبات الورشة",
    description: "متابعة الصيانة والخدمات",
    icon: Wrench,
  },
];

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const loggedInStatus = sessionStorage.getItem("adminLoggedIn");

    if (loggedInStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username === "ro0ak" && password === "99s551905") {
      sessionStorage.setItem("adminLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  const currentTab =
    TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  const handleTabChange = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isLoggedIn) {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F1E9] px-4"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#0F3A2B]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#C9A85C]/15 blur-3xl" />

        <div className="relative w-full max-w-[430px] overflow-hidden rounded-[34px] border border-[#DED8CA] bg-white shadow-[0_30px_100px_rgba(15,58,43,0.18)]">
          <div className="h-2 w-full bg-gradient-to-l from-[#0F3A2B] via-[#315E4C] to-[#C9A85C]" />

          <div className="px-7 py-9 sm:px-10">
            <div className="mb-9 text-center">
              <h1 className="text-4xl font-black tracking-tight text-[#0F3A2B]">
                مِرقاب
              </h1>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#69766F]">
                <ShieldCheck className="h-4 w-4 text-[#B08B3E]" />
                <span>لوحة إدارة المتجر</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#173F31]">
                  اسم المستخدم
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  className="h-14 w-full rounded-2xl border border-[#D9D4C8] bg-[#FAF8F3] px-5 text-right text-[#173F31] outline-none transition placeholder:text-[#A6AAA7] focus:border-[#0F3A2B] focus:bg-white focus:ring-4 focus:ring-[#0F3A2B]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#173F31]">
                  كلمة المرور
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-[#D9D4C8] bg-[#FAF8F3] px-5 text-right text-[#173F31] outline-none transition placeholder:text-[#A6AAA7] focus:border-[#0F3A2B] focus:bg-white focus:ring-4 focus:ring-[#0F3A2B]/10"
                  required
                />
              </div>

              {loginError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0F3A2B] text-base font-black text-white shadow-[0_14px_30px_rgba(15,58,43,0.24)] transition hover:-translate-y-0.5 hover:bg-[#174C39] active:translate-y-0"
              >
                <ShieldCheck className="h-5 w-5" />
                دخول لوحة الإدارة
              </button>
            </form>

            <p className="mt-7 text-center text-xs font-medium text-[#979C98]">
              دخول مخصص لإدارة متجر مرقاب
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F5F2EB] text-[#153E30]"
    >
      {/* الهيدر */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B432F] text-white shadow-[0_10px_35px_rgba(15,58,43,0.22)]">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* زر القائمة يظهر في الجوال فقط */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/20 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* مساحة فارغة بدل شعار مرقاب وحرف م */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 shadow-inner sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />

              <span className="text-xs font-bold text-white/90">
                المسؤول: ro0ak
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 items-center gap-2 rounded-2xl border border-[#D79D88]/30 bg-[#A94A38]/15 px-3.5 text-sm font-bold text-[#FFD9CF] transition hover:border-[#D79D88]/50 hover:bg-[#A94A38]/25 sm:px-5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                تسجيل الخروج
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* القائمة الجانبية للكمبيوتر */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[270px] shrink-0 flex-col overflow-y-auto border-l border-[#E3DED3] bg-[#FEFDF9] px-4 py-5 shadow-[-12px_0_40px_rgba(41,61,50,0.035)] lg:flex">
          <nav className="flex flex-1 flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] px-3 py-3.5 text-right transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-l from-[#0B432F] to-[#14543D] text-white shadow-[0_14px_30px_rgba(15,58,43,0.22)]"
                      : "text-[#234B3D] hover:bg-[#EEF2EC]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#E2C56F]" />
                  )}

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 text-[#F3D980] shadow-inner"
                        : "bg-[#EEF2EC] text-[#315E4C] group-hover:bg-white group-hover:shadow-sm"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">
                      {tab.label}
                    </span>

                    <span
                      className={`mt-1 block truncate text-[11px] font-medium ${
                        isActive
                          ? "text-white/60"
                          : "text-[#879188]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>

                  <ChevronLeft
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      isActive
                        ? "translate-x-0 text-[#F3D980]"
                        : "translate-x-1 text-[#AFB6B0] group-hover:translate-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* القائمة الجانبية للجوال */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 h-full w-full bg-[#071710]/70 backdrop-blur-sm"
              aria-label="إغلاق القائمة"
            />

            <aside className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-[#E3DED3] bg-[#FEFDF9] p-4 shadow-2xl">
              <div className="mb-5 flex items-center justify-end border-b border-[#E6E1D7] pb-4">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEEAE1] text-[#173F31] transition hover:bg-[#E3DED3]"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-[19px] px-3 py-3.5 text-right transition-all ${
                        isActive
                          ? "bg-gradient-to-l from-[#0B432F] to-[#14543D] text-white shadow-lg"
                          : "text-[#234B3D] hover:bg-[#EEF2EC]"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-white/10 text-[#F3D980]"
                            : "bg-[#EEF2EC] text-[#315E4C]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">
                          {tab.label}
                        </span>

                        <span
                          className={`mt-1 block truncate text-[11px] ${
                            isActive
                              ? "text-white/60"
                              : "text-[#879188]"
                          }`}
                        >
                          {tab.description}
                        </span>
                      </span>

                      <ChevronLeft
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-[#F3D980]"
                            : "text-[#AFB6B0]"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* المحتوى */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-7 xl:px-7 xl:py-8">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-wide text-[#B08B3E]">
                  لوحة التحكم
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#0F3A2B] sm:text-3xl">
                  {currentTab.label}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#7C8981]">
                  {currentTab.description}
                </p>
              </div>
            </div>

            <section className="min-w-0 overflow-hidden rounded-[30px] border border-[#DED8CC] bg-white shadow-[0_20px_65px_rgba(41,61,50,0.09)]">
              <div className="h-1.5 w-full bg-gradient-to-l from-[#0B432F] via-[#31634F] to-[#D5B75E]" />

              <div className="w-full min-w-0 p-3 sm:p-5">
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "products" && <ProductsManager />}
                {activeTab === "auctions" && <AuctionsManager />}
                {activeTab === "categories" && (
                  <CategoriesManager />
                )}
                {activeTab === "discounts" && (
                  <DiscountCodesManager />
                )}
                {activeTab === "shipping" && <ShippingManager />}
                {activeTab === "settings" && <SettingsManager />}
                {activeTab === "theme" && <ThemeManager />}
                {activeTab === "workshop" && (
                  <WorkshopRequestsManager />
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
