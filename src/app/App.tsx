import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "next-themes";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ProductsProvider, useProducts } from "./contexts/ProductsContext";
import { ThemeSettingsProvider } from "./contexts/ThemeSettingsContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Auctions from "./pages/Auctions";
import Workshop from "./pages/Workshop";
import Rentals, {
  type RentalCheckoutData,
  type RentalDrone,
} from "./pages/Rentals";
import RentalCheckout from "./pages/RentalCheckout";
import Footer from "./components/Footer";
import AdminDashboard from "./pages/AdminDashboard";

const RENTAL_CHECKOUT_KEY = "mergab_rental_checkout";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function pagePath(page: string) {
  const paths: Record<string, string> = {
    home: "/",
    shop: "/shop",
    rentals: "/rentals",
    auctions: "/auctions",
    workshop: "/workshop",
    "my-orders": "/my-orders",
    cart: "/cart",
    checkout: "/checkout",
    admin: "/admin",
  };

  return paths[page] || "/";
}

function currentPageFromPath(pathname: string) {
  if (pathname.startsWith("/shop") || pathname.startsWith("/product/")) return "shop";
  if (pathname.startsWith("/rentals")) return "rentals";
  if (pathname.startsWith("/auctions")) return "auctions";
  if (pathname.startsWith("/workshop")) return "workshop";
  if (pathname.startsWith("/my-orders")) return "my-orders";
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname.startsWith("/admin")) return "admin";
  return "home";
}

function ProductRoute() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  const product = useMemo(
    () => products.find((item: any) => String(item.id) === String(productId)),
    [products, productId],
  );

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center font-bold text-[#0F3A2B]">جاري تحميل المنتج...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-white border p-8 text-center">
          <h1 className="text-2xl font-black text-[#0F3A2B]">المنتج غير موجود</h1>
          <button onClick={() => navigate("/shop")} className="mt-6 rounded-full bg-[#0F3A2B] px-8 py-3 font-bold text-white">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  const openProduct = (nextProduct: any) => {
    navigate(`/product/${nextProduct.id}/${slugify(nextProduct.name || "product")}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <ProductDetail
        product={{ ...product, image: product.image_url || "" }}
        onBack={() => navigate("/shop")}
        onProductClick={openProduct}
      />
      <Footer onNavigate={(page) => navigate(pagePath(page))} />
    </>
  );
}

function RentalsRoute() {
  const { droneId } = useParams();
  const navigate = useNavigate();

  const startCheckout = (data: RentalCheckoutData) => {
    sessionStorage.setItem(RENTAL_CHECKOUT_KEY, JSON.stringify(data));
    navigate("/rentals/checkout");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <Rentals
        initialDroneId={droneId}
        onDroneOpen={(drone: RentalDrone) =>
          navigate(`/rentals/${drone.id}/${slugify(drone.name)}`)
        }
        onDroneClose={() => navigate("/rentals")}
        onProceedToCheckout={startCheckout}
      />
      <Footer onNavigate={(page) => navigate(pagePath(page))} />
    </>
  );
}

function RentalCheckoutRoute() {
  const navigate = useNavigate();
  const [booking] = useState<RentalCheckoutData | null>(() => {
    try {
      const saved = sessionStorage.getItem(RENTAL_CHECKOUT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  if (!booking) return <Navigate to="/rentals" replace />;

  return (
    <>
      <RentalCheckout
        booking={booking}
        onBack={() => navigate(`/rentals/${booking.drone.id}/${slugify(booking.drone.name)}`)}
        onSuccess={() => {
          sessionStorage.removeItem(RENTAL_CHECKOUT_KEY);
          navigate("/my-orders");
        }}
      />
      <Footer onNavigate={(page) => navigate(pagePath(page))} />
    </>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");

  const [showSplash, setShowSplash] = useState(() => !isAdmin);
  const [splashFade, setSplashFade] = useState(true);

  useEffect(() => {
    if (!showSplash) return;
    const displayTimeout = window.setTimeout(() => setSplashFade(false), 1500);
    const removeTimeout = window.setTimeout(() => setShowSplash(false), 2000);
    return () => {
      window.clearTimeout(displayTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, [showSplash]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const handleNavigate = useCallback(
    (page: string) => navigate(pagePath(page)),
    [navigate],
  );

  const handleProductClick = useCallback(
    (product: any) => {
      navigate(`/product/${product.id}/${slugify(product.name || "product")}`);
    },
    [navigate],
  );

  useEffect(() => {
    const onCheckout = () => navigate("/checkout");
    const openCart = () => setIsCartOpen(true);
    window.addEventListener("navigate-to-checkout", onCheckout);
    window.addEventListener("open-cart", openCart);
    return () => {
      window.removeEventListener("navigate-to-checkout", onCheckout);
      window.removeEventListener("open-cart", openCart);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F7F2] transition-colors duration-500 relative" dir="rtl" lang="ar">
      <style>{`
        @keyframes splashLogo { 0% { opacity: 0; transform: scale(.75); filter: blur(8px); } 55% { opacity: 1; transform: scale(1.06); filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes splashGlow { 0% { opacity: 0; transform: scale(.7); } 60% { opacity: .35; transform: scale(1.15); } 100% { opacity: .18; transform: scale(1); } }
        .splash-logo { animation: splashLogo 1.2s ease-out forwards; }
        .splash-glow { animation: splashGlow 1.2s ease-out forwards; }
      `}</style>

      {showSplash && (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#F8F7F2] transition-opacity duration-500 ${splashFade ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="relative flex items-center justify-center">
            <div className="splash-glow absolute w-72 h-72 rounded-full bg-[#0A261C]/20 blur-3xl" />
            <img src="/merqab.png" alt="مرقاب" className="relative z-10 w-64 h-64 object-contain splash-logo" />
          </div>
        </div>
      )}

      {!isAdmin && (
        <Header
          onNavigate={handleNavigate}
          onCartClick={() => setIsCartOpen(true)}
          currentPage={currentPageFromPath(location.pathname)}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<><HomePage onNavigate={handleNavigate} onProductClick={handleProductClick} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/shop" element={<><Shop onProductClick={handleProductClick} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/product/:productId" element={<ProductRoute />} />
          <Route path="/product/:productId/:slug" element={<ProductRoute />} />
          <Route path="/rentals/checkout" element={<RentalCheckoutRoute />} />
          <Route path="/rentals" element={<RentalsRoute />} />
          <Route path="/rentals/:droneId" element={<RentalsRoute />} />
          <Route path="/rentals/:droneId/:slug" element={<RentalsRoute />} />
          <Route path="/auctions" element={<><Auctions /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/auctions/:auctionId" element={<><Auctions /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/workshop" element={<><Workshop onNavigate={handleNavigate} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/my-orders" element={<><MyOrders onNavigate={handleNavigate} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/cart" element={<><Cart onNavigate={handleNavigate} onCheckout={() => navigate("/checkout")} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/checkout" element={<><Checkout onBack={() => navigate("/cart")} onSuccess={() => navigate("/my-orders")} /><Footer onNavigate={handleNavigate} /></>} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isCartOpen && !isAdmin && (
        <div className="fixed inset-0 z-[9999]">
          <button aria-label="إغلاق السلة" className="absolute inset-0 bg-black/35" onClick={() => setIsCartOpen(false)} />
          <div className="absolute top-0 right-0 h-[100dvh] w-full max-w-md bg-[#F8F7F2] shadow-2xl overflow-y-auto">
            <Cart
              onNavigate={(page) => {
                setIsCartOpen(false);
                handleNavigate(page);
              }}
              onCheckout={() => {
                setIsCartOpen(false);
                navigate("/checkout");
              }}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <ThemeSettingsProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AppContent />
          </ThemeProvider>
        </ThemeSettingsProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
