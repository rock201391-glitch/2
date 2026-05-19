import React, { createContext, useContext, useState, useEffect } from 'react';

import { supabase } from '../../utils/supabase';

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
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'user' | 'wholesale', businessName?: string, taxId?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isWholesale: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async (response: any) => {
      const session = response.data.session;
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: profile?.role || 'user',
          businessName: profile?.businessName,
          taxId: profile?.taxId,
        });
      } else {
        // Fallback to local storage mock user if no supabase session
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: profile?.role || 'user',
          businessName: profile?.businessName,
          taxId: profile?.taxId,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Real Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      return true;
    }

    // Fallback to Mock authentication for admin/wholesale test accounts
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
    }
    return false;
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'wholesale' = 'user', businessName?: string, taxId?: string): Promise<boolean> => {
    // Try Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        }
      }
    });

    if (!error && data.user) {
      // Create profile record
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        full_name: name,
        role: role,
        businessName: businessName || null,
        taxId: taxId || null,
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        alert('تم تسجيل الدخول لكن فشل حفظ البروفايل: ' + profileError.message);
        return false;
      }
      return true;
    }

    if (error) {
      console.error('Registration error:', error);
      alert('خطأ في التسجيل: ' + error.message);
      return false;
    }

    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
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
