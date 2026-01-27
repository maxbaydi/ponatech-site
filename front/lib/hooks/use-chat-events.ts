'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { io, type Socket } from 'socket.io-client';
import { CHAT_KEYS } from './use-chat';
import { NOTIFICATION_KEYS } from './use-notifications';
import { MY_SUPPLY_REQUESTS_QUERY_KEY, SUPPLY_REQUESTS_QUERY_KEY } from './use-supply-requests';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import type { ChatMessage, ChatMessagesResponse } from '@/lib/api/types';

const ACCESS_TOKEN_KEY = 'pona_access_token';
const CATALOG_API_URL = process.env.NEXT_PUBLIC_CATALOG_API_URL || process.env.NEXT_PUBLIC_API_URL;
const RECONNECT_MAX_DELAY_MS = 30000;
const LAST_EVENT_ID_KEY = 'chat_last_event_id';
const TOKEN_REFRESH_THRESHOLD_MS = 30000;
const SOCKET_PATH = '/chat/ws';
const INVALIDATION_DEBOUNCE_MS = 250;

type ChatEventType = 'new_message' | 'message_read' | 'notification' | 'heartbeat';

interface ChatEvent {
  id?: number;
  type: ChatEventType;
  requestId?: string;
  data: unknown;
}

interface UseChatEventsOptions {
  enabled?: boolean;
  requestId?: string;
}

type PendingInvalidations = {
  messageRequests: Set<string>;
  lists: boolean;
  stats: boolean;
  supplyRequests: boolean;
  mySupplyRequests: boolean;
  notificationsList: boolean;
  notificationsStats: boolean;
};

export function useChatEvents({ enabled = true, requestId }: UseChatEventsOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);
  const storageKeyRef = useRef<string>(buildStorageKey(requestId));
  const invalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingInvalidationsRef = useRef<PendingInvalidations>(createPendingInvalidations());

  const scheduleInvalidationFlush = useCallback(() => {
    if (invalidateTimeoutRef.current) {
      return;
    }

    invalidateTimeoutRef.current = setTimeout(() => {
      invalidateTimeoutRef.current = null;
      const pending = pendingInvalidationsRef.current;
      pendingInvalidationsRef.current = createPendingInvalidations();

      pending.messageRequests.forEach((pendingRequestId) => {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messagesByRequest(pendingRequestId) });
      });
      if (pending.lists) {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
      }
      if (pending.stats) {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.stats() });
      }
      if (pending.supplyRequests) {
        queryClient.invalidateQueries({ queryKey: [SUPPLY_REQUESTS_QUERY_KEY] });
      }
      if (pending.mySupplyRequests) {
        queryClient.invalidateQueries({ queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY] });
      }
      if (pending.notificationsList) {
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      }
      if (pending.notificationsStats) {
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats() });
      }
    }, INVALIDATION_DEBOUNCE_MS);
  }, [queryClient]);

  const enqueueInvalidations = useCallback(
    (next: Partial<PendingInvalidations>) => {
      const pending = pendingInvalidationsRef.current;
      if (next.messageRequests) {
        next.messageRequests.forEach((id) => pending.messageRequests.add(id));
      }
      if (next.lists) pending.lists = true;
      if (next.stats) pending.stats = true;
      if (next.supplyRequests) pending.supplyRequests = true;
      if (next.mySupplyRequests) pending.mySupplyRequests = true;
      if (next.notificationsList) pending.notificationsList = true;
      if (next.notificationsStats) pending.notificationsStats = true;

      scheduleInvalidationFlush();
    },
    [scheduleInvalidationFlush]
  );

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      switch (event.type) {
        case 'new_message': {
          const message = extractChatMessage(event);
          if (message?.senderId === user?.id) break;
          if (event.requestId && message) {
            queryClient.setQueryData<ChatMessagesResponse | undefined>(
              CHAT_KEYS.messagesByRequest(event.requestId),
              (current) => appendMessageToCache(current, message),
            );
          }
          if (event.requestId) {
            enqueueInvalidations({
              messageRequests: new Set([event.requestId]),
            });
          }
          enqueueInvalidations({
            lists: true,
            stats: true,
            supplyRequests: true,
            mySupplyRequests: true,
            notificationsList: true,
            notificationsStats: true,
          });
          break;
        }

        case 'message_read':
          if (event.requestId) {
            enqueueInvalidations({
              messageRequests: new Set([event.requestId]),
            });
          }
          enqueueInvalidations({
            lists: true,
            stats: true,
            supplyRequests: true,
            mySupplyRequests: true,
            notificationsStats: true,
          });
          break;

        case 'notification':
          enqueueInvalidations({
            notificationsList: true,
            notificationsStats: true,
          });
          break;

        case 'heartbeat':
          break;
      }
    },
    [queryClient, user?.id, enqueueInvalidations]
  );

  const refreshTokenIfNeeded = useCallback(async () => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (!token) return;
    const expiresAt = getJwtExpiry(token);
    if (!expiresAt) return;
    if (expiresAt - Date.now() > TOKEN_REFRESH_THRESHOLD_MS) {
      return;
    }

    try {
      await apiClient.getCurrentUser();
    } catch {
      // Ignore refresh errors; connection attempt will fail and retry.
    }
  }, []);

  const updateSocketAuth = useCallback((socket: Socket, token: string) => {
    socket.auth = {
      token,
      lastEventId: readLastEventId(storageKeyRef.current),
    };
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isConnectingRef.current || socketRef.current) {
      return;
    }
    isConnectingRef.current = true;

    await refreshTokenIfNeeded();

    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (!token || !CATALOG_API_URL) {
      isConnectingRef.current = false;
      return;
    }

    const socket = io(CATALOG_API_URL, {
      path: SOCKET_PATH,
      transports: ['websocket'],
      reconnectionDelayMax: RECONNECT_MAX_DELAY_MS,
      auth: {
        token,
        lastEventId: readLastEventId(storageKeyRef.current),
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      isConnectingRef.current = false;
    });

    socket.on('connect_error', () => {
      isConnectingRef.current = false;
    });

    socket.on('chat:event', (event: ChatEvent) => {
      if (typeof event.id === 'number') {
        writeLastEventId(storageKeyRef.current, String(event.id));
      }
      handleEvent(event);
    });

    socket.io.on('reconnect_attempt', async () => {
      await refreshTokenIfNeeded();
      const nextToken = Cookies.get(ACCESS_TOKEN_KEY);
      if (nextToken) {
        updateSocketAuth(socket, nextToken);
      }
    });
  }, [handleEvent, refreshTokenIfNeeded, updateSocketAuth]);

  const disconnect = useCallback(() => {
    if (invalidateTimeoutRef.current) {
      clearTimeout(invalidateTimeoutRef.current);
      invalidateTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    isConnectingRef.current = false;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    storageKeyRef.current = buildStorageKey(requestId);
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, requestId, connect, disconnect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => reconnect();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        reconnect();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reconnect]);

  const isConnected = socketRef.current?.connected ?? false;

  return {
    isConnected,
    reconnect,
    disconnect,
  };
}

const createPendingInvalidations = (): PendingInvalidations => ({
  messageRequests: new Set<string>(),
  lists: false,
  stats: false,
  supplyRequests: false,
  mySupplyRequests: false,
  notificationsList: false,
  notificationsStats: false,
});

const buildStorageKey = (requestId?: string): string =>
  requestId ? `${LAST_EVENT_ID_KEY}:${requestId}` : `${LAST_EVENT_ID_KEY}:all`;

const readLastEventId = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return String(parsed);
  } catch {
    return null;
  }
};

const writeLastEventId = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return;
  }
  try {
    window.localStorage.setItem(key, String(parsed));
  } catch {
    // Ignore storage errors
  }
};

const getJwtExpiry = (token: string): number | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const extractChatMessage = (event: ChatEvent): ChatMessage | null => {
  const payload = event.data as Partial<ChatMessage> | undefined;
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  if (!payload.id || !payload.requestId) {
    return null;
  }
  return payload as ChatMessage;
};

const appendMessageToCache = (
  current: ChatMessagesResponse | undefined,
  message: ChatMessage,
): ChatMessagesResponse => {
  if (!current) {
    return {
      data: [message],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
  }

  if (current.data.some((item) => item.id === message.id)) {
    return current;
  }

  const data = [...current.data, message];
  const total = current.total + 1;
  const totalPages = Math.max(current.totalPages, Math.ceil(total / current.limit));

  return {
    ...current,
    data,
    total,
    totalPages,
  };
};
