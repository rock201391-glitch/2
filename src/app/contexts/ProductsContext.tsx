import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export interface Product {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  purchase_price: number | null;
  selling_price: number | null;
  discount_enabled: boolean;
  original_price: number | null;
  image_url: string | null;
  quantity: number;
  category_id: number | null;
  colors: string[] | null;
  is_active: boolean;
  is_pinned: boolean;
  pinned_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export function getDiscountPercent(product: Product): number {
  const oldPrice = Number(product.original_price);
  const price = Number(product.price);
  if (!product.discount_enabled || !product.original_price || oldPrice <= price || price < 0) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshProducts() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProducts((data as Product[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void refreshProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
