import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'wholesale';
  businessName?: string;
  taxId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'user' | 'wholesale', businessName?: string, taxId?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isWholesale: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, call API
    if (email === 'admin@luxury.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@luxury.com',
        name: 'Admin',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return true;
    } else if (email === 'wholesale@luxury.com' && password === 'wholesale123') {
      const wholesaleUser: User = {
        id: '2',
        email: 'wholesale@luxury.com',
        name: 'Wholesale Customer',
        role: 'wholesale',
        businessName: 'Demo Wholesale Business',
        taxId: '123456789',
      };
      setUser(wholesaleUser);
      localStorage.setItem('user', JSON.stringify(wholesaleUser));
      return true;
    } else if (email === 'customer@luxury.com' && password === 'customer123') {
      const customerUser: User = {
        id: '3',
        email: 'customer@luxury.com',
        name: 'Ahmed Al-Rashidi',
        role: 'user',
      };
      setUser(customerUser);
      localStorage.setItem('user', JSON.stringify(customerUser));
      return true;
    } else if (email && password) {
      const normalUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: 'user',
      };
      setUser(normalUser);
      localStorage.setItem('user', JSON.stringify(normalUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'wholesale' = 'user', businessName?: string, taxId?: string): Promise<boolean> => {
    // Mock registration - in real app, call API
    if (name && email && password) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role,
        businessName,
        taxId,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isWholesale: user?.role === 'wholesale',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
