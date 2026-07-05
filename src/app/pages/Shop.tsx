import { useState, useEffect } from 'react';
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

export default function Shop({ onProductClick }: ShopProps) {
  const { addItem } = useCart();
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setCategories(data as Category[]);
    }
    fetchCategories();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const getCategoryName = (category_id: number | null) => {
    if (!category_id) return '';
    const cat = categories.find(c => c.id === category_id);
    return cat?.name || '';
  };

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

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#0F3A2B' }}>
          متجر مرقاب
        </h1>

        {/* Filter */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={selectedCategory === null ? { backgroundColor: '#0F3A2B' } : {}}
          >
            الكل
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={selectedCategory === category.id ? { backgroundColor: '#0F3A2B' } : {}}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg font-medium" style={{ color: '#0F3A2B' }}>
              جاري تحميل المنتجات...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg font-medium text-gray-500">
              لا توجد منتجات حالياً
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                <div
                  className="flex items-center justify-center h-32 mb-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                  style={{ backgroundColor: '#FBF7EF' }}
                  onClick={() => handleProductClick(product)}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                </div>
                <h3
                  className="text-lg font-bold mb-2 cursor-pointer hover:underline"
                  style={{ color: '#0F3A2B' }}
                  onClick={() => handleProductClick(product)}
                >
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
                    {product.price}ر.ع
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex-1 px-4 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#0F3A2B' }}
                  >
                    {addedProducts.has(product.id) ? '✓ تمت الإضافة' : 'إضافة للسلة'}
                  </button>
                  <button
                    onClick={() => handleProductClick(product)}
                    className="px-4 py-3 rounded-full font-semibold transition-all border-2"
                    style={{
                      borderColor: '#0F3A2B',
                      color: '#0F3A2B',
                      backgroundColor: 'transparent'
                    }}
                  >
                    التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
