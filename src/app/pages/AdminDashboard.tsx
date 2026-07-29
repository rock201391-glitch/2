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
  WalletCards,
} from "lucide-react";

import OrdersTab from "../components/admin/OrdersTab";
import StoreAccountsManager from "../components/admin/StoreAccountsManager";
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
  | "accounts"
  | "products"
  | "auctions"
  | "workshop"
  | "categories"
  | "discounts"
  | "shipping"
  | "theme"
  | "settings";

type TabItem = {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
};

const TABS: TabItem[] = [
  {
    id: "orders",
    label: "الطلبات",
    icon: ShoppingBag,
  },
  {
    id: "accounts",
    label: "حسابات المتجر",
    icon: WalletCards,
  },
  {
    id: "products",
    label: "المنتجات",
    icon: Package,
  },
  {
    id: "auctions",
    label: "المزادات",
    icon: Gavel,
  },
  {
    id: "workshop",
    label: "طلبات الورشة",
    icon: Wrench,
  },
  {
    id: "categories",
    label: "الأقسام والتصنيفات",
    icon: Layers3,
  },
  {
    id: "discounts",
    label: "كوبونات الخصم",
    icon: TicketPercent,
  },
  {
    id: "shipping",
    label: "شركات الشحن",
    icon: Truck,
  },
  {
    id: "theme",
    label: "هوية المتجر",
    icon: Palette,
  },
  {
    id: "settings",
    label: "إعدادات البنك",
    icon: Landmark,
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
        className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#030B08] px-4 text-white"
      >
        {/* خلفية فضائية مع تأثير النقاط المتلألئة */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-cyan-600/15 blur-[140px]" />

        <div className="relative w-full max-w-[430px] overflow-hidden rounded-[34px] border border-emerald-500/20 bg-[#061510]/80 shadow-[0_30px_100px_rgba(4,47,31,0.5)] backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-400 to-cyan-500" />

          <div className="px-7 py-9 sm:px-10">
            <div className="mb-9 text-center">
              <h1 className="text-4xl font-black tracking-tight text-white">
                مِرقاب
              </h1>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400/80">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>لوحة إدارة المتجر</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-emerald-100">
                  اسم المستخدم
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  className="h-14 w-full rounded-2xl border border-emerald-900/50 bg-[#020A07] px-5 text-right text-white outline-none transition placeholder:text-emerald-700/50 focus:border-emerald-500 focus:bg-[#04120D] focus:ring-4 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-emerald-100">
                  كلمة المرور
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-emerald-900/50 bg-[#020A07] px-5 text-right text-white outline-none transition placeholder:text-emerald-700/50 focus:border-emerald-500 focus:bg-[#04120D] focus:ring-4 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {loginError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-center text-sm font-bold text-red-400 backdrop-blur-md">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-black text-white shadow-[0_14px_30px_rgba(5,150,105,0.35)] transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-500 active:translate-y-0"
              >
                <ShieldCheck className="h-5 w-5" />
                دخول لوحة الإدارة
              </button>
            </form>

            <p className="mt-7 text-center text-xs font-medium text-emerald-500/60">
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
      className="min-h-screen bg-[#030B08] text-emerald-50 relative selection:bg-emerald-500 selection:text-black"
    >
      {/* خلفية فضائية مع نقاط متلألئة موحدة للوحة بالكامل */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] z-0" />
      <div className="pointer-events-none fixed -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[150px] z-0" />

      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/40 bg-[#04120D]/90 text-white shadow-[0_10px_35px_rgba(2,8,6,0.5)] backdrop-blur-md">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-800/40 bg-emerald-950/40 transition hover:bg-emerald-900/50 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5 text-emerald-400" />
          </button>

          <div className="hidden lg:block font-serif font-black text-xl tracking-wider text-emerald-300">
            مِرقاب
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-emerald-800/40 bg-emerald-950/40 px-4 py-2.5 shadow-inner sm:flex backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
              <span className="text-xs font-bold text-emerald-100">
                المسؤول: ro0ak
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 items-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/30 px-3.5 text-sm font-bold text-red-300 transition hover:border-red-500/60 hover:bg-red-900/40 sm:px-5 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-72px)]">
        {/* القائمة الجانبية للكمبيوتر */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[270px] shrink-0 flex-col overflow-y-auto border-l border-emerald-900/30 bg-[#05110C]/90 px-4 py-5 shadow-[-12px_0_40px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <nav className="flex flex-1 flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] px-3.5 py-3.5 text-right transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-l from-emerald-700 via-teal-700 to-cyan-800 text-white shadow-[0_10px_25px_rgba(5,150,105,0.3)]"
                      : "text-emerald-300/80 hover:bg-emerald-950/50 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-l-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
                  )}

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-black/20 text-emerald-200 shadow-inner"
                        : "bg-emerald-950/60 text-emerald-400 group-hover:bg-emerald-900/60 group-hover:text-emerald-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black tracking-wide">
                      {tab.label}
                    </span>
                  </span>

                  <ChevronLeft
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      isActive
                        ? "translate-x-0 text-emerald-200"
                        : "translate-x-1 text-emerald-700 group-hover:translate-x-0 group-hover:text-emerald-400"
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
              className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
              aria-label="إغلاق القائمة"
            />

            <aside className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-emerald-900/40 bg-[#05110C] p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between border-b border-emerald-900/40 pb-4">
                <span className="font-serif font-black text-lg text-emerald-300">قائمة الإدارة</span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950/60 text-emerald-200 transition hover:bg-emerald-900/60"
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
                      className={`flex w-full items-center gap-3 rounded-[19px] px-3.5 py-3.5 text-right transition-all ${
                        isActive
                          ? "bg-gradient-to-l from-emerald-700 via-teal-700 to-cyan-800 text-white shadow-lg"
                          : "text-emerald-300/80 hover:bg-emerald-950/50 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-black/20 text-emerald-200"
                            : "bg-emerald-950/60 text-emerald-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black tracking-wide">
                          {tab.label}
                        </span>
                      </span>

                      <ChevronLeft
                        className={`h-4 w-4 ${
                          isActive ? "text-emerald-200" : "text-emerald-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* محتوى لوحة التحكم */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-7 xl:px-7 xl:py-8">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-wide text-emerald-400">
                  لوحة التحكم
                </p>
                <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                  {currentTab.label}
                </h2>
              </div>
            </div>

            <section className="min-w-0 overflow-hidden rounded-[30px] border border-emerald-900/40 bg-[#05130E]/80 shadow-[0_20px_65px_rgba(2,12,8,0.6)] backdrop-blur-md">
              <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-400 to-cyan-500" />

              <div className="w-full min-w-0 p-3 sm:p-5">
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "accounts" && <StoreAccountsManager />}
                {activeTab === "products" && <ProductsManager />}
                {activeTab === "auctions" && <AuctionsManager />}
                {activeTab === "workshop" && <WorkshopRequestsManager />}
                {activeTab === "categories" && <CategoriesManager />}
                {activeTab === "discounts" && <DiscountCodesManager />}
                {activeTab === "shipping" && <ShippingManager />}
                {activeTab === "theme" && <ThemeManager />}
                {activeTab === "settings" && <SettingsManager />}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
