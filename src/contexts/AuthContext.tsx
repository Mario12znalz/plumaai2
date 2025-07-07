import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('plumaai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - in production, this would connect to your backend
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      subscription: 'basic'
    };
    setUser(mockUser);
    localStorage.setItem('plumaai_user', JSON.stringify(mockUser));
  };

  const loginWithGoogle = async () => {
    // Mock Google OAuth - in production, this would use Google OAuth
    const mockUser = {
      id: '2',
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      subscription: 'premium'
    };
    setUser(mockUser);
    localStorage.setItem('plumaai_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock registration - in production, this would connect to your backend
    const mockUser = {
      id: '3',
      email,
      name,
      subscription: 'basic'
    };
    setUser(mockUser);
    localStorage.setItem('plumaai_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('plumaai_user');
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}