import { useAuth } from '@/lib/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, allowedRoles, router]);

  return { hasAccess: user && allowedRoles.includes(user.role), isLoading };
}