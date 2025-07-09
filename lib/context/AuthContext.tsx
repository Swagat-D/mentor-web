'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'mentor' | 'student' | 'admin';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'mentor' | 'student';
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Add this useEffect after the existing checkAuth useEffect
useEffect(() => {
  // Redirect to login if not authenticated and trying to access protected routes
  const protectedPaths = ['/dashboard', '/onboarding', '/profile', '/sessions', '/settings']
  const currentPath = window.location.pathname
  
  if (!isLoading && !isAuthenticated && protectedPaths.some(path => currentPath.startsWith(path))) {
    router.push('/login')
  }
  
  // Redirect to appropriate onboarding step if authenticated but incomplete
  if (!isLoading && isAuthenticated && user?.role === 'mentor' && currentPath === '/dashboard') {
    checkOnboardingStatus()
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, isLoading, router, user])

const checkOnboardingStatus = async () => {
  try {
    const response = await fetch('/api/onboarding/progress', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      const { currentStep, isComplete, isSubmitted } = data.data;
      
      if (!isSubmitted && !isComplete) {
        router.push(`/onboarding/${currentStep}`);
      } else if (!isSubmitted && isComplete) {
        router.push('/onboarding/review');
      }
    }
  } catch (error) {
    console.error('Onboarding status check failed:', error);
  }
};

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.data.user);
      
      // Redirect based on role and profile completion
      router.push(data.data.redirectTo);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, redirect to login with message
      router.push('/login?message=Please check your email to verify your account');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      // Token refreshed successfully, update user session
      await checkAuth();
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}