import {
  ShoppingBag,
  Menu,
  X,
  Home,
  Box,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Wrench,
  CalendarDays,
  Languages,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";

interface HeaderProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  currentPage: string;
}

export default function Header({
  onNavigate,
  onCartClick,
  currentPage,
}: HeaderProps) {
  const { items } = useCart();
  const { language, isArabic, direction, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t("الرئيسية", "Home"), id: "home" },
    { label: t("المتجر", "Shop"), id: "shop" },
    { label: t("التأجير", "Rentals"), id: "rentals" },
    { label: t("المزادات", "Auctions"), id: "auctions" },
    { label: t("الورشة", "Workshop"), id: "workshop" },
    { label: t("مشترياتي", "My Orders"), id: "my-orders" },
  ];

  const cartCount = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  function navigate(page: string) {
    onNavigate(page);
    setMobileMenuOpen(false);
  }

  const DirectionArrow = isArabic ? ChevronLeft : ChevronRight;

  return (
    <header
      dir={direction}
      className="sticky top-0 z-40 border-b border-[#FBF7EF] bg-[#F7F4ED]"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-cart-target="true"
              aria-label={t("فتح السلة", "Open cart")}
              onClick={onCartClick}
              className="group relative rounded-full p-2 transition-all duration-300 hover:scale-110 hover:bg-[#FBF7EF] hover:shadow-md active:scale-95"
            >
              <ShoppingBag
                className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
                style={{ color: "#0F3A2B" }}
              />

              {cartCount > 0 && (
                <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F3A2B] text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t("تغيير اللغة إلى الإنجليزية", "Switch language to Arabic")}
              title={t("English", "العربية")}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#D7D0C1] bg-white px-3 text-xs font-black text-[#0F3A2B] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0F3A2B]/40"
            >
              <Languages className="h-4 w-4" />
              <span>{language === "ar" ? "EN" : "AR"}</span>
            </button>
          </div>

          <nav className="hidden items-center gap-1 rounded-[22px] border border-[#0F3A2B] bg-[#0F3A2B] p-2 shadow-md md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  item.id === currentPage
                    ? "bg-[#F7F5EF] shadow-md"
                    : "hover:bg-[#F7F5EF]/20"
                }`}
                style={{
                  color:
                    item.id === currentPage ? "#0F3A2B" : "#F7F5EF",
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button type="button" onClick={() => navigate("home")}>
            <img
              src="/merqab.png"
              alt={t("مرقاب", "Mergab")}
              className="h-20 w-auto object-contain sm:h-24 md:h-28"
            />
          </button>

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? t("إغلاق القائمة", "Close menu")
                : t("فتح القائمة", "Open menu")
            }
            className="p-2 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: "#0F3A2B" }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: "#0F3A2B" }} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] md:hidden">
            <button
              type="button"
              aria-label={t("إغلاق القائمة", "Close menu")}
              className="absolute inset-0 bg-black/35 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside
              className={`absolute top-0 flex h-[100dvh] w-[82%] max-w-[390px] flex-col bg-[#F8F7F2] shadow-2xl ${
                isArabic
                  ? "right-0 border-l border-[#E5E1D8]"
                  : "left-0 border-r border-[#E5E1D8]"
              }`}
              dir={direction}
            >
              <div className="flex-shrink-0 border-b border-[#E5E1D8] px-6 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
                    aria-label={t("إغلاق", "Close")}
                  >
                    <X className="h-6 w-6 text-[#0F3A2B]" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D7D0C1] bg-white px-4 text-sm font-black text-[#0F3A2B] shadow-sm"
                  >
                    <Languages className="h-4 w-4" />
                    {language === "ar" ? "English" : "العربية"}
                  </button>
                </div>

                <div className="text-center">
                  <img
                    src="/merqab.png"
                    alt={t("مرقاب", "Mergab")}
                    className="mx-auto h-24 w-auto object-contain"
                  />

                  <p className="mt-1 text-sm tracking-widest text-[#9AA69F]">
                    {t("متجر الدرونات الاحترافية", "Professional Drone Store")}
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                <h3
                  className={`mb-5 text-xl font-bold text-[#0F3A2B] ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {t("التنقل", "Navigation")}
                </h3>

                <nav className="flex flex-col gap-3">
                  {navItems.map((item) => {
                    const Icon =
                      item.id === "home"
                        ? Home
                        : item.id === "shop"
                          ? Box
                          : item.id === "rentals"
                            ? CalendarDays
                            : item.id === "auctions"
                              ? Gavel
                              : item.id === "workshop"
                                ? Wrench
                                : ShoppingBag;

                    const active = item.id === currentPage;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.id)}
                        className={`flex w-full items-center justify-between rounded-[26px] px-5 py-4 text-xl font-bold transition-all ${
                          active ? "shadow-lg" : ""
                        }`}
                        style={{
                          backgroundColor: active
                            ? "#0F3A2B"
                            : "transparent",
                          color: active ? "#F8F7F2" : "#0F3A2B",
                        }}
                      >
                        {isArabic ? (
                          <>
                            <DirectionArrow className="h-5 w-5 flex-shrink-0" />
                            <span className="mx-3 flex-1 text-center">
                              {item.label}
                            </span>
                            <Icon className="h-6 w-6 flex-shrink-0" />
                          </>
                        ) : (
                          <>
                            <Icon className="h-6 w-6 flex-shrink-0" />
                            <span className="mx-3 flex-1 text-center">
                              {item.label}
                            </span>
                            <DirectionArrow className="h-5 w-5 flex-shrink-0" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div
                className="flex-shrink-0 border-t border-[#E5E1D8] bg-[#F8F7F2] px-6 py-4 text-center text-xs font-bold tracking-[0.22em] text-[#B6BDB4]"
                style={{
                  paddingBottom:
                    "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                © MERGAB STORE 2026
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
}
