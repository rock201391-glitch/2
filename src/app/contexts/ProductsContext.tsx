import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  retailPrice: number;
  wholesalePrice: number;
  image: string;
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
    // Load products from localStorage or use initial products
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('products', JSON.stringify(initialProducts));
    }
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, ...productData } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const deleteProduct = (id: number) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
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
