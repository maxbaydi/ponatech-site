'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { CartProvider } from '@/lib/cart-provider';
import { ChatEventsProvider } from '@/lib/chat-events-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatEventsProvider>
          <CartProvider>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </CartProvider>
        </ChatEventsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
