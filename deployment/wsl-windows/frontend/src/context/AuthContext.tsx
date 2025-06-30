// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && token);

  useEffect(() => {
    // Try to load token and user from localStorage on initial app load
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading auth state from localStorage:', error);
      // Clear potentially corrupted storage
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      
      // Store auth data
      localStorage.setItem('authUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      
      setUser(response.user);
      setToken(response.token);
      
      toast.success(`Welcome back, ${response.user.username}!`);
    } catch (error: any) {
      // Error is already handled by API interceptor
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      const response = await authService.register(userData);
      
      // Store auth data
      localStorage.setItem('authUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      
      setUser(response.user);
      setToken(response.token);
      
      toast.success(`Account created successfully! Welcome, ${response.user.username}!`);
    } catch (error: any) {
      // Error is already handled by API interceptor
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
