import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import Features from './components/Features';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Wholesale from './pages/Wholesale';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WholesaleDashboard from './pages/WholesaleDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import { useAuth } from './contexts/AuthContext';

type Page = 'home' | 'product-detail' | 'cart' | 'about' | 'contact' | 'wholesale' | 'login' | 'admin' | 'wholesale-dashboard' | 'customer-dashboard' | 'shop';

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
            <Hero onNavigate={handleNavigate} />
            <Products
              onProductClick={handleProductClick}
              onViewAll={() => handleNavigate('shop')}
              limit={5}
            />
            <Features />
          </>
        );
      case 'shop':
        return <Shop onProductClick={handleProductClick} />;
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setCurrentPage('home')}
          />
        ) : null;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'wholesale':
        return <Wholesale />;
      case 'login':
        return <Login onSuccess={(role) => {
          if (role === 'admin') setCurrentPage('admin');
          else if (role === 'wholesale') setCurrentPage('wholesale-dashboard');
          else setCurrentPage('customer-dashboard');
        }} />;
      case 'admin':
        return <AdminDashboard />;
      case 'wholesale-dashboard':
        return <WholesaleDashboard onProductClick={handleProductClick} />;
      case 'customer-dashboard':
        return <CustomerDashboard onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 transition-colors duration-500">
                <Header
                  onNavigate={handleNavigate}
                  onCartClick={() => handleNavigate('cart')}
                />
                <main>{renderPage()}</main>
                {currentPage === 'home' && <Footer />}
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}