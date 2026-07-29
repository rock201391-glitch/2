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

  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

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
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[25px] bg-[#0F3A2B] text-3xl font-black text-[#F8F4E8] shadow-[0_15px_35px_rgba(15,58,43,0.28)]">
                م
              </div>

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
      className="min-h-screen bg-[#F4F1E9] text-[#153E30]"
    >
      {/* الهيدر */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F3A2B] text-white shadow-[0_10px_30px_rgba(15,58,43,0.18)]">
        <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/15 lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6F1E5] text-xl font-black text-[#0F3A2B] shadow-lg">
              م
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wide">مِرقاب</h1>

                <span className="hidden rounded-full border border-[#E0C77B]/30 bg-[#E0C77B]/15 px-2.5 py-1 text-[10px] font-bold text-[#F3DF9F] sm:inline-flex">
                  الإدارة
                </span>
              </div>

              <p className="mt-0.5 hidden text-xs text-white/55 sm:block">
                إدارة المتجر والطلبات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span className="text-xs font-bold text-white/90">
                المسؤول: ro0ak
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 items-center gap-2 rounded-2xl border border-red-300/20 bg-red-400/10 px-3.5 text-sm font-bold text-red-100 transition hover:bg-red-400/20 sm:px-5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-76px)]">
        {/* القائمة الجانبية للكمبيوتر */}
        <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-[285px] shrink-0 flex-col overflow-y-auto border-l border-[#DDD7CA] bg-[#FBFAF6] px-4 py-6 lg:flex">
          <div className="mb-6 px-3">
            <p className="text-xs font-black tracking-wider text-[#B08B3E]">
              لوحة مرقاب
            </p>

            <h2 className="mt-1 text-lg font-black text-[#123B2D]">
              إدارة المتجر
            </h2>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`group flex w-full items-center gap-3 rounded-[20px] px-3 py-3.5 text-right transition-all ${
                    isActive
                      ? "bg-[#0F3A2B] text-white shadow-[0_12px_25px_rgba(15,58,43,0.20)]"
                      : "text-[#234B3D] hover:bg-[#E9EEE8]"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                      isActive
                        ? "bg-white/12 text-[#F2D98C]"
                        : "bg-[#EEF1EB] text-[#315E4C] group-hover:bg-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">
                      {tab.label}
                    </span>

                    <span
                      className={`mt-0.5 block truncate text-[11px] font-medium ${
                        isActive ? "text-white/55" : "text-[#849087]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>

                  <ChevronLeft
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-[#F2D98C]" : "text-[#A6AEA8]"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[22px] border border-[#DDD5C4] bg-[#F5F0E4] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F3A2B] text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-[#153E30]">
                  لوحة آمنة
                </p>
                <p className="text-[11px] font-medium text-[#808A83]">
                  مرقاب لإدارة المتجر
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* القائمة الجانبية للجوال */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 h-full w-full bg-[#071710]/65 backdrop-blur-sm"
              aria-label="إغلاق القائمة"
            />

            <aside className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto bg-[#FBFAF6] p-4 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#E3DED3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3A2B] text-xl font-black text-white">
                    م
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#0F3A2B]">
                      مِرقاب
                    </h2>
                    <p className="text-xs font-medium text-[#849087]">
                      إدارة المتجر
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEEAE1] text-[#173F31]"
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
                      className={`flex w-full items-center gap-3 rounded-[19px] px-3 py-3 text-right ${
                        isActive
                          ? "bg-[#0F3A2B] text-white shadow-lg"
                          : "text-[#234B3D] hover:bg-[#E9EEE8]"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive ? "bg-white/10" : "bg-[#EEF1EB]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="flex-1 text-sm font-black">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* المحتوى */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-7 xl:px-8">
          <div className="mx-auto w-full max-w-[1700px]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black text-[#B08B3E]">
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

            <section className="min-w-0 rounded-[28px] border border-[#DED8CC] bg-white p-3 shadow-[0_16px_50px_rgba(41,61,50,0.08)] sm:p-5">
              <div className="w-full min-w-0 overflow-x-auto">
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "products" && <ProductsManager />}
                {activeTab === "auctions" && <AuctionsManager />}
                {activeTab === "categories" && <CategoriesManager />}
                {activeTab === "discounts" && <DiscountCodesManager />}
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
