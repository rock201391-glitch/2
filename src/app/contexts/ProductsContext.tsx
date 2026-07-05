import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface Product {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  category_id: number | null;
  colors: string[] | null;
  is_active: boolean;
  created_at: string | null;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
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

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
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