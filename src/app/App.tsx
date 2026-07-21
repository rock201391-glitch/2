import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from './contexts/CartContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { ThemeSettingsProvider } from './contexts/ThemeSettingsContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import Auctions from './pages/Auctions';
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
  | 'auctions'
  | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return false;
    }
    return true;
  });

  const [splashFade, setSplashFade] = useState<boolean>(true);

  useEffect(() => {
    if (!showSplash) return;

    const displayTimeout = setTimeout(() => {
      setSplashFade(false);
    }, 1500);

    const removeTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      clearTimeout(displayTimeout);
      clearTimeout(removeTimeout);
    };
  }, [showSplash]);

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

  const handleProductClick = useCallback((product: any) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onCheckout = () => {
      window.history.replaceState(null, '', '/');
      setCurrentPage('checkout');
    };

    window.addEventListener('navigate-to-checkout', onCheckout);

    return () => {
      window.removeEventListener('navigate-to-checkout', onCheckout);
    };
  }, []);

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
              onBack={() => setCurrentPage('shop')}
              onProductClick={handleProductClick}
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

      case 'auctions':
        return (
          <>
            <Auctions />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      case 'admin':
        if (window.location.hash !== '#admin') {
          return (
            <>
              <HomePage
                onNavigate={handleNavigate}
                onProductClick={handleProductClick}
              />
              <Footer onNavigate={handleNavigate} />
            </>
          );
        }

        return <AdminDashboard />;

      default:
        return null;
    }
  };

  return (
    <ProductsProvider>
      <CartProvider>
        <ThemeSettingsProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <style>{`
              @keyframes splashLogo {
                0% {
                  opacity: 0;
                  transform: scale(0.75);
                  filter: blur(8px);
                }

                55% {
                  opacity: 1;
                  transform: scale(1.06);
                  filter: blur(0px);
                }

                100% {
                  opacity: 1;
                  transform: scale(1);
                  filter: blur(0px);
                }
              }

              @keyframes splashGlow {
                0% {
                  opacity: 0;
                  transform: scale(0.7);
                }

                60% {
                  opacity: 0.35;
                  transform: scale(1.15);
                }

                100% {
                  opacity: 0.18;
                  transform: scale(1);
                }
              }

              .splash-logo {
                animation: splashLogo 1.2s ease-out forwards;
              }

              .splash-glow {
                animation: splashGlow 1.2s ease-out forwards;
              }
            `}</style>

            <div
              className="min-h-screen bg-[#F8F7F2] transition-colors duration-500 relative"
              dir="rtl"
              lang="ar"
            >
              {showSplash && (
                <div
                  className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#F8F7F2] transition-opacity duration-500 ease-in-out ${
                    splashFade ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="splash-glow absolute w-72 h-72 rounded-full bg-[#0A261C]/20 blur-3xl" />

                    <img
                      src="/merqab.png"
                      alt="مرقاب"
                      className="relative z-10 w-64 h-64 object-contain splash-logo"
                    />
                  </div>
                </div>
              )}

              {currentPage !== 'admin' && (
                <Header
                  onNavigate={handleNavigate}
                  onCartClick={() => setIsCartOpen(true)}
                  currentPage={currentPage}
                />
              )}

              <main>{renderPage()}</main>

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
        </ThemeSettingsProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
