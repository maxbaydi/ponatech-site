'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useChatEvents } from '@/lib/hooks/use-chat-events';

interface ChatEventsContextValue {
  isConnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

const ChatEventsContext = createContext<ChatEventsContextValue | null>(null);

export function ChatEventsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { isConnected, reconnect, disconnect } = useChatEvents({
    enabled: isAuthenticated,
  });

  return (
    <ChatEventsContext.Provider value={{ isConnected, reconnect, disconnect }}>
      {children}
    </ChatEventsContext.Provider>
  );
}

export function useChatEventsContext() {
  const context = useContext(ChatEventsContext);
  if (!context) {
    throw new Error('useChatEventsContext must be used within ChatEventsProvider');
  }
  return context;
}
