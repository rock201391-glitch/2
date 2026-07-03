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

type Page = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'track-order' | 'my-orders';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

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
      default:
        return null;
    }
  };

  return (
    <ProductsProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="min-h-screen bg-[#F8F7F2] transition-colors duration-500" dir="rtl" lang="ar">
            <Header
              onNavigate={handleNavigate}
              onCartClick={() => handleNavigate('cart')}
            />
            <main>{renderPage()}</main>
          </div>
        </ThemeProvider>
      </CartProvider>
    </ProductsProvider>
  );
}