import { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
}

export default function Header({ onNavigate, onCartClick }: HeaderProps) {
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
          <nav className="hidden md:flex items-center gap-1 bg-[#FBF7EF] rounded-full px-6 py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white"
                style={{ color: '#0F3A2B' }}
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
    className="h-12 w-auto"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right px-4 py-3 rounded-lg hover:bg-[#FBF7EF] transition-colors text-sm font-medium"
                style={{ color: '#0F3A2B' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
