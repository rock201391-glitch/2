import { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
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
className="absolute inset-0 bg-black/30 backdrop-blur-sm"
onClick={() => setMobileMenuOpen(false)}
/>

<div className="absolute top-0 right-0 h-screen w-[78%] bg-[#F8F7F2] shadow-2xl border-l border-[#E5E1D8] px-8 py-10 overflow-y-auto">
  
<div className="flex justify-end mb-10">

<button
onClick={()=>setMobileMenuOpen(false)}
className="text-4xl"

style={{
color:'#0F3A2B'
}}
>

×

</button>

</div>

<nav className="flex flex-col gap-7 mt-10">

{navItems.map((item)=>(

<button
key={item.id}
onClick={()=>{
onNavigate(item.id);
setMobileMenuOpen(false);
}}

className="text-right text-[30px] font-bold py-5 px-8"

style={{
color:item.id===currentPage
?'#F8F7F2'
:'#0F3A2B',

backgroundColor:item.id===currentPage
?'#0F3A2B'
:'transparent',

borderRadius:'999px',
minHeight:'82px'
}}

>

{item.label}

</button>

))}

</nav>
<div
style={{
position:'absolute',
bottom:'30px',
left:'0',
right:'0',
textAlign:'center',
color:'#B6BDB4',
fontSize:'14px',
fontWeight:'700'
}}
>

MERGAB STORE 2026 ©

</div>
</div>

</div>

)}
      </div>
    </header>
  );
}

