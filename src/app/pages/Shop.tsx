import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import { supabase } from '../../lib/supabase';

interface ShopProps {
  onProductClick: (product: any) => void;
}

interface Category {
  id: number;
  name: string;
}

type SortOption = 'newest' | 'price-desc' | 'price-asc';
type CategoryFilterKey = 'all' | 'drones' | 'cameras' | 'microphones' | 'accessories';

interface CategoryFilterOption {
  key: Exclude<CategoryFilterKey, 'all'>;
  label: string;
  aliases: string[];
}

// تعديل اللون النشط ليكون أخضر ديواني فخم متناسق مع الخلفيات
const FILTER_BAR_ACTIVE_COLOR = '#0A261C';
const FILTER_BAR_INACTIVE_BG = '#FBF7EF';
const FILTER_BAR_INACTIVE_BORDER = '#EDE9E1';
const FILTER_BAR_CHIP_BASE_CLASS = 'rounded-full border font-medium whitespace-nowrap transition-all duration-200 text-center';

const categoryFilterOptions: CategoryFilterOption[] = [
  { key: 'drones', label: 'الدرون', aliases: ['الدرون', 'الدرونات', 'drone', 'drones'] },
  { key: 'cameras', label: 'الكاميرات', aliases: ['الكاميرات', 'الكاميرا', 'camera', 'cameras'] },
  { key: 'microphones', label: 'المايكات', aliases: ['المايكات', 'المايك', 'الميكروفونات', 'الميكروفون', 'mic', 'mics', 'microphone', 'microphones'] },
  { key: 'accessories', label: 'إكسسوارات', aliases: ['إكسسوارات', 'اكسسوارات', 'الإكسسوارات', 'الاكسسوارات', 'الملحقات', 'ملحقات', 'accessory', 'accessories'] },
];

function normalizeCategoryName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

const normalizedCategoryFilterOptions = categoryFilterOptions.map((filter) => ({
  ...filter,
  normalizedAliases: filter.aliases.map(normalizeCategoryName),
}));

function getFilterChipClass(isActive: boolean, sizeClassName: string) {
  return `${FILTER_BAR_CHIP_BASE_CLASS} ${sizeClassName} ${
    isActive
      ? 'text-white border-transparent shadow-sm font-semibold'
      : 'text-[#4E6159] hover:border-[#0A261C] hover:text-[#0A261C]'
  }`;
}

function getFilterChipStyle(isActive: boolean) {
  return isActive
    ? { backgroundColor: FILTER_BAR_ACTIVE_COLOR }
    : { backgroundColor: FILTER_BAR_INACTIVE_BG, borderColor: FILTER_BAR_INACTIVE_BORDER };
}

export default function Shop({ onProductClick }: ShopProps) {
  const { addItem } = useCart();
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      if (categoryError) {
        console.error('Failed to fetch categories:', categoryError.message);
      } else if (data) {
        setCategories(data as Category[]);
      }
    }
    fetchCategories();
  }, []);

  const getCategoryName = (category_id: number | null) => {
    if (!category_id) return '';
    const cat = categories.find(c => c.id === category_id);
    return cat?.name || '';
  };

  const resolvedCategoryFilters = useMemo(() => {
    return normalizedCategoryFilterOptions.map((filter) => {
      const ids = categories
        .filter((category) => {
          const normalizedName = normalizeCategoryName(category.name);
          return filter.normalizedAliases.some((normalizedAlias) => {
            return (
              normalizedName === normalizedAlias ||
              normalizedName.includes(normalizedAlias) ||
              normalizedAlias.includes(normalizedName)
            );
          });
        })
        .map((category) => category.id);

      return { ...filter, ids };
    });
  }, [categories]);

  const selectedCategoryIds = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return resolvedCategoryFilters.find((filter) => filter.key === selectedCategory)?.ids ?? [];
  }, [resolvedCategoryFilters, selectedCategory]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'الكل';
    return resolvedCategoryFilters.find((filter) => filter.key === selectedCategory)?.label ?? 'هذا التصنيف';
  }, [resolvedCategoryFilters, selectedCategory]);

  const sortedFilteredProducts = useMemo(() => {
    let list = selectedCategoryIds
      ? products.filter((product) => product.category_id !== null && selectedCategoryIds.includes(product.category_id))
      : products;

    list = [...list].sort((a: any, b: any) => {
      // 1. الأولوية للمنتجات المثبتة
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // 2. إذا كلاهما مثبت، الترتيب حسب pinned_order
      if (a.is_pinned && b.is_pinned) {
        return (a.pinned_order ?? 0) - (b.pinned_order ?? 0);
      }

      // 3. إذا كلاهما غير مثبت، نطبق معايير الفرز الأخرى
      if (sortOption === 'newest') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;
        return dateB - dateA;
      }

      if (sortOption === 'price-desc') {
        return b.price - a.price;
      }

      if (sortOption === 'price-asc') {
        return a.price - b.price;
      }

      return 0;
    });

    return list;
  }, [products, selectedCategoryIds, sortOption]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || '',
    });
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handleProductClick = (product: any) => {
    onProductClick({
      ...product,
      image: product.image_url || '',
      category: getCategoryName(product.category_id),
    });
  };

  const sortButtons: { key: SortOption; label: string }[] = [
    { key: 'newest', label: 'الأحدث' },
    { key: 'price-desc', label: 'الأعلى سعراً' },
    { key: 'price-asc', label: 'الأقل سعراً' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F2]" dir="rtl">
      <div
        className="relative w-full py-10 px-4 flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#0D3125]/20"
        style={{ 
          background: 'linear-gradient(90deg, #071C15 0%, #0A261C 50%, #0D3125 100%)' 
        }}
      >
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M9 15c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 .6.4 1 1 1zm30 0c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 .6.4 1 1 1zM9 45c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 .6.4 1 1 1zm30 0c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 .6.4 1 1 1zM0 30h60M30 0v60' stroke='%23ffffff' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '45px 45px'
          }}
        />
        <h1 
          className="text-3xl md:text-4xl text-[#FBF7EF] mb-2 tracking-[0.05em] select-none"
          style={{ 
            fontWeight: 800,
            textShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          تسوّق الآن
        </h1>
        <p className="text-[#FBF7EF]/70 text-xs md:text-sm font-light max-w-xs md:max-w-md tracking-normal">
          منتجات مختارة بعناية لعشاق التقنية
        </p>
      </div>

      <div className="sticky top-0 z-10 bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#E8E4DC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 md:py-4">
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto lg:justify-start">
              <button
                onClick={() => setSelectedCategory('all')}
                className={getFilterChipClass(selectedCategory === 'all', 'px-4.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm min-w-[55px] md:min-w-[65px]')}
                style={getFilterChipStyle(selectedCategory === 'all')}
              >
                الكل
              </button>
              {resolvedCategoryFilters.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={getFilterChipClass(selectedCategory === category.key, 'px-4.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm')}
                  style={getFilterChipStyle(selectedCategory === category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="w-full h-[1px] bg-[#EDE9E1] lg:hidden" />

            <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto lg:justify-end">
              {sortButtons.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortOption(key)}
                  className={getFilterChipClass(sortOption === key, 'px-3 py-1.5 text-[11px] md:text-xs')}
                  style={getFilterChipStyle(sortOption === key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#0A261C', borderTopColor: 'transparent' }}
              />
              <p className="text-base font-medium" style={{ color: '#0A261C' }}>
                جاري تحميل المنتجات...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-24">
            <p className="text-base font-medium text-red-500">
              حدث خطأ أثناء تحميل المنتجات
            </p>
          </div>
        )}

        {!loading && !error && sortedFilteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              📦
            </div>
            <p className="text-base font-medium text-gray-500">
              {selectedCategory === 'all'
                ? 'لا توجد منتجات حالياً'
                : `لا توجد منتجات ضمن ${selectedCategoryLabel} حالياً`}
            </p>
          </div>
        )}

        {!loading && !error && sortedFilteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedFilteredProducts.map((product) => {
              const isAdded = addedProducts.has(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  style={{ border: '1px solid #EDE9E1' }}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1', backgroundColor: '#FBF7EF' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}

                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          نفذت الكمية
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className="p-4 flex flex-col flex-1"
                    style={{ backgroundColor: '#0A261C' }}
                  >
                    <h3
                      className="text-sm font-bold mb-1 leading-snug line-clamp-2"
                      style={{ color: '#F8F7F2' }}
                    >
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span
                        className="text-lg font-bold"
                        style={{ color: '#F8F7F2' }}
                      >
                        {product.price} <span className="text-xs font-medium">ر.ع</span>
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.quantity === 0}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: isAdded ? '#F8F7F2' : 'transparent',
                          color: isAdded ? '#0A261C' : '#F8F7F2',
                          border: '1px solid #F8F7F2',
                        }}
                      >
                        {isAdded ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
