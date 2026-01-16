'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCartStore } from '@/lib/cart';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const hydrate = useCartStore((state) => state.hydrate);
  const reset = useCartStore((state) => state.reset);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      reset();
      return;
    }

    hydrate();
  }, [user?.id, isAuthLoading, hydrate, reset]);

  return <>{children}</>;
}
