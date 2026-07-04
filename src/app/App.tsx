import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from './contexts/CartContext';
import { ProductsProvider } from './contexts/ProductsContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';

type Page =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'track-order'
  | 'my-orders'
  | 'admin';

export default function App() {
  // الحالة البدئية تبدأ دائماً من الرئيسية كما طلبت
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // فحص الرابط عند تحميل الصفحة لأول مرة وتوجيه الأدمن بشكل معزول ونظيف
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // شاشة الترحيب تفتح true فقط إذا لم يكن الرابط الأولي يحتوي على #admin
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return false;
    }
    return true;
  });
  const [splashFade, setSplashFade] = useState<boolean>(true);

  // إدارة مؤقت شاشة الترحيب (تعمل لمرة واحدة فقط عند بداية الزيارة)
  useEffect(() => {
    if (!showSplash) return;

    const displayTimeout = setTimeout(() => {
      setSplashFade(false); // بدء التلاشي الناعم بعد 1.5 ثانية
    }, 1500);

    const removeTimeout = setTimeout(() => {
      setShowSplash(false); // إزالة العنصر تماماً من شجرة الـ DOM بعد ثانيتين
    }, 2000);

    return () => {
      clearTimeout(displayTimeout);
      clearTimeout(removeTimeout);
    };
  }, [showSplash]);

  // دالة التنقل المعدلة بدقة التي تمنع ظهور صفحة الأدمن للزبائن وتتحكم بالرابط
  const handleNavigate = (page: string) => {
    if (page === 'admin') {
      window.location.hash = 'admin';
      setCurrentPage('admin');
    } else {
      window.history.replaceState(null, '', '/');
      setCurrentPage(page as Page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <HomePage
              onNavigate={handleNavigate}
              onProductClick={handleProductClick}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'shop':
        return (
          <>
            <Shop onProductClick={handleProductClick} />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'product-detail':
        return selectedProduct ? (
          <>
            <ProductDetail
              product={selectedProduct}
              onBack={() => setCurrentPage('home')}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        ) : null;

      case 'cart':
        return (
          <>
            <Cart
              onNavigate={handleNavigate}
              onCheckout={() => setCurrentPage('checkout')}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'checkout':
        return (
          <>
            <Checkout
              onBack={() => setCurrentPage('cart')}
              onSuccess={() => setCurrentPage('my-orders')}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'track-order':
        return (
          <>
            <TrackOrder />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'my-orders':
        return (
          <>
            <MyOrders onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'admin':
        return <AdminDashboard />;

      default:
        return null;
    }
  };

  return (
    <ProductsProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div
            className="min-h-screen bg-[#F8F7F2] transition-colors duration-500 relative"
            dir="rtl"
            lang="ar"
          >
            {/* شاشة الترحيب الفخمة لمتجر مرقاب */}
            {showSplash && (
              <div
                className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F7F2] text-[#0F3A2B] transition-opacity duration-500 ease-in-out ${
                  splashFade ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="text-center">
                  <h1 className="text-6xl font-bold tracking-widest mb-3 font-serif animate-pulse">
                    مِرقاب
                  </h1>
                  
                  <div className="w-16 h-[2px] bg-[#0F3A2B] mx-auto opacity-30 mb-4 rounded-full"></div>
                  
                  <p className="text-xs tracking-[0.35em] text-gray-500 font-medium uppercase font-sans">
                    MERGAB SHOP
                  </p>
                </div>
              </div>
            )}

            {/* الهيدر العلوي - يختفي تماماً وبشكل تلقائي في صفحة الأدمن */}
            {currentPage !== 'admin' && (
              <Header
                onNavigate={handleNavigate}
                onCartClick={() => setIsCartOpen(true)}
                currentPage={currentPage}
              />
            )}

            <main>{renderPage()}</main>

            {/* نافذة السلة الجانبية */}
            {isCartOpen && (
              <div className="fixed inset-0 z-[9999]">
                <div
                  className="absolute inset-0 bg-black/35"
                  onClick={() => setIsCartOpen(false)}
                />

                <div className="absolute top-0 right-0 h-screen w-full max-w-md bg-[#F8F7F2] shadow-2xl overflow-y-auto">
                  <Cart
                    onNavigate={(page) => {
                      setIsCartOpen(false);
                      handleNavigate(page);
                    }}
                    onCheckout={() => {
                      setIsCartOpen(false);
                      setCurrentPage('checkout');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </ThemeProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
