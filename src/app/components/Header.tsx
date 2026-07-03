import { useState } from 'react';
import { ShoppingBag, Menu, X, Home, Box, MapPin, ChevronLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  currentPage: string;
}

export default function Header({
  onNavigate,
  onCartClick,
  currentPage
}: HeaderProps) {
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'الرئيسية', id: 'home' },
    { label: 'المتجر', id: 'shop' },
    { label: 'مشترياتي', id: 'my-orders' },
    { label: 'تتبع الطلب', id: 'track-order' },
  ];

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4ED] border-b border-[#FBF7EF]">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Cart Icon - Left */}
          <button
            onClick={onCartClick}
            className="relative p-2 rounded-full hover:bg-[#FBF7EF] transition-colors"
          >
            <ShoppingBag className="w-6 h-6" style={{ color: '#0F3A2B' }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-[#0F3A2B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Navigation Menu - Center */}
         <nav className="hidden md:flex items-center gap-1 bg-[#0F3A2B] rounded-[22px] p-2 shadow-md border border-[#0F3A2B]">
            {navItems.map((item) => (
          <button
  key={item.id}
  onClick={() => {
    onNavigate(item.id);
    setMobileMenuOpen(false);
  }}
 className={`px-7 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
  item.id === currentPage
    ? 'bg-[#F7F5EF] shadow-md'
    : 'hover:bg-[#F7F5EF]/20'
}`}
style={{ color: item.id === currentPage ? '#0F3A2B' : '#F7F5EF' }}
>
  {item.label}
</button>
            ))}
          </nav>

      {/* Logo - Right */}
<button
  onClick={() => onNavigate('home')}
>
  <img
    src="/merqab.png"
    alt="مرقاب"
    className="h-24 md:h-28 w-auto object-contain"
  />
</button>  

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: '#0F3A2B' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: '#0F3A2B' }} />
            )}
          </button>
        </div>

{/* Mobile Side Menu */}
{mobileMenuOpen && (
  <div className="fixed inset-0 z-[9999] md:hidden">
    <div
      className="absolute inset-0 bg-black/35 backdrop-blur-md"
      onClick={() => setMobileMenuOpen(false)}
    />

    <div className="absolute top-0 right-0 h-screen w-[75%] bg-[#F8F7F2] shadow-2xl border-l border-[#E5E1D8] overflow-hidden">
      
      <button
        onClick={() => setMobileMenuOpen(false)}
        className="absolute top-7 right-7 text-3xl z-10"
        style={{ color: '#0F3A2B' }}
      >
        ×
      </button>

      <div className="pt-20 pb-8 text-center border-b border-[#E5E1D8]">
        <img
          src="/merqab.png"
          alt="مرقاب"
         className="h-28 mx-auto object-contain"
        />
        
        <p className="mt-2 text-sm tracking-widest text-[#9AA69F]">
          متجر الدرونات الاحترافية
        </p>
      </div>

      <div className="px-7 pt-12">
        <h3 className="text-xl font-bold mb-7 text-right" style={{ color: '#0F3A2B' }}>
          التنقل
        </h3>

        <nav className="flex flex-col gap-5">
          {navItems.map((item) => {
            const Icon =
              item.id === 'home'
                ? Home
                : item.id === 'shop'
                ? Box
                : item.id === 'my-orders'
                ? ShoppingBag
                : MapPin;

            const active = item.id === currentPage;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-7 py-5 rounded-full text-2xl font-bold transition-all ${
                  active ? 'shadow-xl' : ''
                }`}
                style={{
                  backgroundColor: active ? '#0F3A2B' : 'transparent',
                  color: active ? '#F8F7F2' : '#0F3A2B'
                }}
              >
                <ChevronLeft
                  className="w-6 h-6"
                  style={{ color: active ? '#D8C99B' : '#B8C0BA' }}
                />

                <span>{item.label}</span>

                <Icon
                  className="w-7 h-7"
                  style={{ color: active ? '#D8C99B' : '#6E7F76' }}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center text-sm tracking-widest text-[#B6BDB4] font-bold">
        MERGAB STORE 2026 ©
      </div>
    </div>
  </div>
)}
      </div>
    </header>
  );
}

