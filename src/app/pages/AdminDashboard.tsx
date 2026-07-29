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
        className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#031D15] px-4 text-[#F3EAD2]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(213,229,220,0.16)_1px,transparent_1.4px)] bg-[size:24px_24px] opacity-40" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#1B6A4E]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#8FA99C]/15 blur-3xl" />

        <div className="relative w-full max-w-[430px] overflow-hidden rounded-[34px] border border-white/10 bg-[#08271D]/95 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-l from-[#D9CFB1] via-[#7F9B8D] to-[#1C5A43]" />

          <div className="px-7 py-9 sm:px-10">
            <div className="mb-9 text-center">
              <h1 className="text-4xl font-black tracking-tight text-[#F3EAD2]">
                مِرقاب
              </h1>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#A8BBB0]">
                <ShieldCheck className="h-4 w-4 text-[#D9CFB1]" />
                <span>لوحة إدارة المتجر</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#E8E1CF]">
                  اسم المستخدم
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-right text-[#F5F0E4] outline-none transition placeholder:text-[#789084] focus:border-[#9DB3A8] focus:bg-white/[0.09] focus:ring-4 focus:ring-[#9DB3A8]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#E8E1CF]">
                  كلمة المرور
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-right text-[#F5F0E4] outline-none transition placeholder:text-[#789084] focus:border-[#9DB3A8] focus:bg-white/[0.09] focus:ring-4 focus:ring-[#9DB3A8]/10"
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
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#E9DFC5] text-base font-black text-[#0B3427] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#F3EAD2] active:translate-y-0"
              >
                <ShieldCheck className="h-5 w-5" />
                دخول لوحة الإدارة
              </button>
            </form>

            <p className="mt-7 text-center text-xs font-medium text-[#7F978A]">
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
      className="min-h-screen bg-[#021A13] text-[#F2EBD8]"
    >
      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#031F17]/95 text-white shadow-[0_10px_35px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/20 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-xl font-black tracking-[0.08em] text-[#F3EAD2] lg:block">
            مِرقاب
          </div>

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
              className="flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-3.5 text-sm font-bold text-[#F6F3EB] transition hover:bg-white/[0.15] sm:px-5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* القائمة الجانبية للكمبيوتر */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[286px] shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#05241A] px-4 py-5 shadow-[-18px_0_45px_rgba(0,0,0,0.22)] lg:flex">
          <div className="mb-5 rounded-[26px] border border-white/10 bg-white/[0.045] px-4 py-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#789487]">
              MERGAB ADMIN
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-[#F3EAD2]">
              إدارة المتجر
            </h3>
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
                  className={`group relative flex min-h-[62px] w-full items-center gap-3 overflow-hidden rounded-[20px] px-3.5 py-3 text-right transition-all duration-300 ${
                    isActive
                      ? "bg-[#E9DFC5] text-[#0A3426] shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
                      : "text-[#DCE6E0] hover:bg-white/[0.06]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#6F8D7E]" />
                  )}

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-[#0E4A37]/10 text-[#0A3A2A] shadow-inner"
                        : "bg-white/[0.07] text-[#AFC3B8] group-hover:bg-white/[0.11] group-hover:text-[#F3EAD2]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1 text-sm font-black">
                    {tab.label}
                  </span>

                  <ChevronLeft
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      isActive
                        ? "translate-x-0 text-[#557466]"
                        : "translate-x-1 text-[#668176] group-hover:translate-x-0 group-hover:text-[#AFC3B8]"
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

            <aside className="absolute right-0 top-0 h-full w-[88%] max-w-[360px] overflow-y-auto border-l border-white/10 bg-[#05241A] p-4 shadow-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-lg font-black tracking-wide text-[#F3EAD2]">
                  قائمة الإدارة
                </span>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#F3EAD2] transition hover:bg-white/[0.12]"
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
                      className={`flex min-h-[62px] w-full items-center gap-3 rounded-[19px] px-3.5 py-3 text-right transition-all ${
                        isActive
                          ? "bg-[#E9DFC5] text-[#0A3426] shadow-lg"
                          : "text-[#DCE6E0] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-[#0E4A37]/10 text-[#0A3A2A]"
                            : "bg-white/[0.07] text-[#AFC3B8]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0 flex-1 text-sm font-black">
                        {tab.label}
                      </span>

                      <ChevronLeft
                        className={`h-4 w-4 ${
                          isActive ? "text-[#557466]" : "text-[#668176]"
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
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[#031F17] px-3 py-5 sm:px-5 sm:py-7 xl:px-7 xl:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(211,226,217,0.18)_1px,transparent_1.3px)] bg-[size:24px_24px] opacity-30" />
          <div className="pointer-events-none absolute -right-40 top-8 h-[460px] w-[460px] rounded-full bg-[#176047]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-10 h-[420px] w-[420px] rounded-full bg-[#759083]/10 blur-3xl" />

          <div className="relative mx-auto w-full max-w-[1800px]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-[#8FA79B]">
                  لوحة التحكم
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#F3EAD2] sm:text-3xl">
                  {currentTab.label}
                </h2>
              </div>
            </div>

            <section className="relative min-w-0 overflow-hidden rounded-[30px] border border-white/10 bg-[#F3EDE0] shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
              <div className="h-1.5 w-full bg-gradient-to-l from-[#0A3E2D] via-[#537564] to-[#CFC5AA]" />

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
