import {
  ShoppingBag,
  Menu,
  X,
  Home,
  Box,
  ChevronLeft,
  Gavel,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "الرئيسية", id: "home" },
    { label: "المتجر", id: "shop" },
    { label: "التأجير", id: "rentals" },
    { label: "المزادات", id: "auctions" },
    { label: "الورشة", id: "workshop" },
    { label: "مشترياتي", id: "my-orders" },
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

  return (
    <header className="sticky top-0 z-40 border-b border-[#FBF7EF] bg-[#F7F4ED]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-cart-target="true"
            aria-label="فتح السلة"
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

          <nav className="hidden items-center gap-1 rounded-[22px] border border-[#0F3A2B] bg-[#0F3A2B] p-2 shadow-md md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`rounded-2xl px-7 py-3 text-sm font-semibold transition-all duration-300 ${
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
              alt="مرقاب"
              className="h-24 w-auto object-contain md:h-28"
            />
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
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
              aria-label="إغلاق القائمة"
              className="absolute inset-0 bg-black/35 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside
              className="absolute right-0 top-0 flex h-[100dvh] w-[82%] max-w-[390px] flex-col border-l border-[#E5E1D8] bg-[#F8F7F2] shadow-2xl"
              dir="rtl"
            >
              <div className="flex-shrink-0 border-b border-[#E5E1D8] px-6 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
                    aria-label="إغلاق"
                  >
                    <X
                      className="h-6 w-6"
                      style={{ color: "#0F3A2B" }}
                    />
                  </button>

                  <div className="w-11" />
                </div>

                <div className="text-center">
                  <img
                    src="/merqab.png"
                    alt="مرقاب"
                    className="mx-auto h-24 w-auto object-contain"
                  />

                  <p className="mt-1 text-sm tracking-widest text-[#9AA69F]">
                    متجر الدرونات الاحترافية
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                <h3 className="mb-5 text-right text-xl font-bold text-[#0F3A2B]">
                  التنقل
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
                        <ChevronLeft
                          className="h-5 w-5 flex-shrink-0"
                          style={{
                            color: active ? "#D8C99B" : "#B8C0BA",
                          }}
                        />

                        <span className="mx-3 flex-1 text-center">
                          {item.label}
                        </span>

                        <Icon
                          className="h-6 w-6 flex-shrink-0"
                          style={{
                            color: active ? "#D8C99B" : "#6E7F76",
                          }}
                        />
                      </button>
                    );
                  })}
                </nav>

                <div className="h-6" />
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
