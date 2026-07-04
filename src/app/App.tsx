import { useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState<Page>(
  window.location.hash === '#admin' ? 'admin' : 'home'
);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
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
        return (
          <>
            <AdminDashboard />
            <Footer onNavigate={handleNavigate} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ProductsProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div
            className="min-h-screen bg-[#F8F7F2] transition-colors duration-500"
            dir="rtl"
            lang="ar"
          >
            <Header
              onNavigate={handleNavigate}
              onCartClick={() => setIsCartOpen(true)}
              currentPage={currentPage}
            />

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
      </CartProvider>
    </ProductsProvider>
  );
}
