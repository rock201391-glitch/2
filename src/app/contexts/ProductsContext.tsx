import React, { createContext, useContext, useState, useEffect } from 'react';

import { supabase } from '../../utils/supabase';

export interface Product {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  retailPrice: number;
  wholesalePrice: number;
  costPrice?: number;
  discountPercentage?: number;
  image: string;
  additionalImages?: string[];
  description?: string;
  descriptionAr?: string;
  stock?: number;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Classic Black Abaya',
    nameAr: 'عباية سوداء كلاسيكية',
    category: 'Classic',
    categoryAr: 'كلاسيكي',
    retailPrice: 299,
    wholesalePrice: 199,
    image: 'https://images.unsplash.com/photo-1583391265574-e7af45a9f9c6?w=800&q=80',
    stock: 50,
  },
  {
    id: 2,
    name: 'Embroidered Elegance',
    nameAr: 'عباية مطرزة أنيقة',
    category: 'Elegant',
    categoryAr: 'أنيق',
    retailPrice: 449,
    wholesalePrice: 299,
    image: 'https://images.unsplash.com/photo-1596783047051-59ff4a2c0025?w=800&q=80',
    stock: 30,
  },
  {
    id: 3,
    name: 'Modern Minimalist',
    nameAr: 'عباية عصرية بسيطة',
    category: 'Modern',
    categoryAr: 'عصري',
    retailPrice: 349,
    wholesalePrice: 229,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    stock: 45,
  },
  {
    id: 4,
    name: 'Casual Comfort',
    nameAr: 'عباية يومية مريحة',
    category: 'Casual',
    categoryAr: 'يومي',
    retailPrice: 249,
    wholesalePrice: 169,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
    stock: 60,
  },
  {
    id: 5,
    name: 'Premium Silk',
    nameAr: 'عباية حريرية فاخرة',
    category: 'Elegant',
    categoryAr: 'أنيق',
    retailPrice: 599,
    wholesalePrice: 399,
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
    stock: 20,
  },
  {
    id: 6,
    name: 'Contemporary Style',
    nameAr: 'عباية معاصرة',
    category: 'Modern',
    categoryAr: 'عصري',
    retailPrice: 399,
    wholesalePrice: 269,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea1bc75c?w=800&q=80',
    stock: 35,
  },
];

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      // Map potential lowercase column names to camelCase for the frontend
      const mappedData = data.map((item: any) => ({
        ...item,
        nameAr: item.nameAr || item.namear,
        categoryAr: item.categoryAr || item.categoryar,
        retailPrice: item.retailPrice || item.retailprice,
        wholesalePrice: item.wholesalePrice || item.wholesaleprice,
        costPrice: item.costPrice || item.costprice,
        discountPercentage: item.discountPercentage || item.discountpercentage,
        additionalImages: item.additionalImages || item.additionalimages,
        descriptionAr: item.descriptionAr || item.descriptionar,
      }));
      setProducts(mappedData as Product[]);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) {
      console.error('Error adding product:', error);
      alert('خطأ في إضافة المنتج: ' + error.message + '\n' + error.details);
    } else if (data) {
      setProducts([...products, data[0] as Product]);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating product:', error);
    } else if (data) {
      setProducts(products.map(p => p.id === id ? { ...p, ...data[0] } : p));
    }
  };

  const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
}
