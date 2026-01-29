'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import type {
  ChatListItem,
  ChatMessage,
  ChatMessageSenderType,
  ChatMessagesFilters,
  ChatMessagesResponse,
  ChatStats,
  PaginatedResponse,
  SupplyRequest,
  SendMessageRequest,
  UserRole,
} from '@/lib/api/types';
import { MY_SUPPLY_REQUESTS_QUERY_KEY, SUPPLY_REQUESTS_QUERY_KEY } from '@/lib/hooks/use-supply-requests';

const CHAT_KEYS = {
  all: ['chat'] as const,
  lists: () => [...CHAT_KEYS.all, 'list'] as const,
  list: (includeRequestId?: string) => [...CHAT_KEYS.lists(), includeRequestId ?? 'all'] as const,
  messages: () => [...CHAT_KEYS.all, 'messages'] as const,
  messagesByRequest: (requestId: string, filters?: ChatMessagesFilters) =>
    [...CHAT_KEYS.messages(), requestId, filters] as const,
  stats: () => [...CHAT_KEYS.all, 'stats'] as const,
};

export function useChatList(includeRequestId?: string): UseQueryResult<ChatListItem[]> {
  return useQuery<ChatListItem[], Error>({
    queryKey: CHAT_KEYS.list(includeRequestId),
    queryFn: () => apiClient.getChatList(includeRequestId),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}

export function useChatMessages(
  requestId: string | undefined,
  filters?: ChatMessagesFilters
): UseQueryResult<ChatMessagesResponse> {
  const queryClient = useQueryClient();

  const query = useQuery<ChatMessagesResponse, Error>({
    queryKey: CHAT_KEYS.messagesByRequest(requestId ?? '', filters),
    queryFn: () => apiClient.getChatMessages(requestId!, filters),
    enabled: !!requestId,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!query.data) return;
    queryClient.setQueryData<ChatMessagesResponse | undefined>(
      CHAT_KEYS.messagesByRequest(requestId ?? '', filters),
      (current) => mergeFetchedMessages(current, query.data)
    );
  }, [query.data, queryClient, requestId, filters]);

  return query as UseQueryResult<ChatMessagesResponse>;
}

export function useChatStats(options?: { enabled?: boolean }): UseQueryResult<ChatStats> {
  return useQuery<ChatStats, Error>({
    queryKey: CHAT_KEYS.stats(),
    queryFn: () => apiClient.getChatStats(),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    enabled: options === undefined ? true : options.enabled,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ data, files }: { data: SendMessageRequest; files?: File[] }) => {
      if (files && files.length > 0) {
        return apiClient.sendChatMessageWithAttachments(data, files);
      }
      return apiClient.sendChatMessage(data);
    },
    onMutate: async ({ data }) => {
      const optimisticId = buildOptimisticId();
      const senderType = resolveSenderType(user?.role);
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        requestId: data.requestId,
        senderType,
        senderId: user?.id,
        senderName: user?.name ?? undefined,
        content: data.content,
        isRead: true,
        createdAt: new Date().toISOString(),
        attachments: [],
      };

      await queryClient.cancelQueries({ queryKey: CHAT_KEYS.messagesByRequest(data.requestId) });
      const previous = queryClient.getQueryData<ChatMessagesResponse | undefined>(
        CHAT_KEYS.messagesByRequest(data.requestId)
      );

      queryClient.setQueryData<ChatMessagesResponse | undefined>(
        CHAT_KEYS.messagesByRequest(data.requestId),
        (current) => appendMessage(current, optimisticMessage)
      );

      return { previous, optimisticId, requestId: data.requestId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          CHAT_KEYS.messagesByRequest(context.requestId),
          context.previous
        );
      }
    },
    onSuccess: (message, _variables, context) => {
      queryClient.setQueryData<ChatMessagesResponse | undefined>(
        CHAT_KEYS.messagesByRequest(message.requestId),
        (current) => replaceOptimisticMessage(current, context?.optimisticId, message)
      );
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.stats() });
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => apiClient.markChatAsRead(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: CHAT_KEYS.lists() });
      await queryClient.cancelQueries({ queryKey: [SUPPLY_REQUESTS_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY] });
      const previousLists = queryClient.getQueriesData<ChatListItem[]>({
        queryKey: CHAT_KEYS.lists(),
      });
      const previousStats = queryClient.getQueryData<ChatStats>(CHAT_KEYS.stats());
      const previousSupplyRequests = queryClient.getQueriesData<RequestsCacheValue>({
        queryKey: [SUPPLY_REQUESTS_QUERY_KEY],
      });
      const previousMyRequests = queryClient.getQueriesData<RequestsCacheValue>({
        queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY],
      });

      queryClient.setQueriesData<ChatListItem[]>(
        { queryKey: CHAT_KEYS.lists() },
        (current) =>
          current
            ? current.map((chat) =>
              chat.requestId === requestId ? { ...chat, unreadCount: 0 } : chat
            )
            : current
      );

      queryClient.setQueriesData<PaginatedResponse<SupplyRequest> | SupplyRequest>(
        { queryKey: [SUPPLY_REQUESTS_QUERY_KEY] },
        (current) => updateRequestsUnreadCount(current, requestId)
      );
      queryClient.setQueriesData<PaginatedResponse<SupplyRequest> | SupplyRequest>(
        { queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY] },
        (current) => updateRequestsUnreadCount(current, requestId)
      );

      if (previousStats) {
        const hasUnread = hasUnreadForRequest(previousLists, previousSupplyRequests, requestId);
        if (hasUnread && previousStats.unreadChats > 0) {
          queryClient.setQueryData<ChatStats>(CHAT_KEYS.stats(), {
            ...previousStats,
            unreadChats: Math.max(0, previousStats.unreadChats - 1),
          });
        }
      }

      return { previousLists, previousSupplyRequests, previousMyRequests, previousStats };
    },
    onError: (_error, _requestId, context) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousSupplyRequests?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousMyRequests?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousStats) {
        queryClient.setQueryData(CHAT_KEYS.stats(), context.previousStats);
      }
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messagesByRequest(requestId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: [SUPPLY_REQUESTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY] });
    },
  });
}

export { CHAT_KEYS };

const buildOptimisticId = (): string => `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const resolveSenderType = (role?: UserRole): ChatMessageSenderType =>
  role && role !== 'CUSTOMER' ? 'MANAGER' : 'CUSTOMER';

const appendMessage = (
  current: ChatMessagesResponse | undefined,
  message: ChatMessage
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

const replaceOptimisticMessage = (
  current: ChatMessagesResponse | undefined,
  optimisticId: string | undefined,
  message: ChatMessage
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

  const optimisticIndex = optimisticId
    ? current.data.findIndex((item) => item.id === optimisticId)
    : -1;

  let data = current.data;
  if (optimisticIndex < 0) {
    data = stripOptimisticDuplicates(data, message);
  }

  const hasMessage = data.some((item) => item.id === message.id);

  if (optimisticIndex >= 0) {
    data = data.map((item) => (item.id === optimisticId ? message : item));
  } else if (!hasMessage) {
    data = [...data, message];
  }

  data = stripOptimisticDuplicates(data, message);

  const byId = new Map<string, ChatMessage>();
  for (const item of data) {
    byId.set(item.id, item);
  }
  data = Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const total = hasMessage
    ? current.total
    : optimisticIndex >= 0
      ? current.total
      : current.total + 1;
  const totalPages = Math.max(current.totalPages, Math.ceil(total / current.limit));

  return {
    ...current,
    data,
    total,
    totalPages,
  };
};

const mergeFetchedMessages = (
  current: ChatMessagesResponse | undefined,
  fetched: ChatMessagesResponse
): ChatMessagesResponse => {
  if (!current) {
    return fetched;
  }

  const currentIds = new Set(current.data.map((message) => message.id));
  const hasAllFetched = fetched.data.every((message) => currentIds.has(message.id));
  if (hasAllFetched && current.total >= fetched.total) {
    return current;
  }

  const byId = new Map<string, ChatMessage>();
  for (const message of fetched.data) {
    byId.set(message.id, message);
  }

  for (const message of current.data) {
    if (!byId.has(message.id)) {
      byId.set(message.id, message);
    }
  }

  const data = Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const total = Math.max(fetched.total, data.length);
  const totalPages = Math.max(fetched.totalPages, Math.ceil(total / fetched.limit));

  return {
    ...fetched,
    data,
    total,
    totalPages,
  };
};

const isOptimisticMessage = (message: ChatMessage): boolean =>
  message.id.startsWith('optimistic-');

const isSameMessage = (optimistic: ChatMessage, message: ChatMessage): boolean => {
  if (optimistic.requestId !== message.requestId) return false;
  if (optimistic.content.trim() !== message.content.trim()) return false;
  if (optimistic.senderType !== message.senderType) return false;
  if ((optimistic.senderId ?? '') !== (message.senderId ?? '')) return false;
  const optimisticTime = new Date(optimistic.createdAt).getTime();
  const messageTime = new Date(message.createdAt).getTime();
  return Math.abs(optimisticTime - messageTime) < 60000;
};

const stripOptimisticDuplicates = (data: ChatMessage[], message: ChatMessage): ChatMessage[] =>
  data.filter((item) => !(isOptimisticMessage(item) && isSameMessage(item, message)));

type RequestsCacheValue = PaginatedResponse<SupplyRequest> | SupplyRequest;

const updateRequestsUnreadCount = (
  current: RequestsCacheValue | undefined,
  requestId: string
): RequestsCacheValue | undefined => {
  if (!current) return current;

  if (isPaginatedRequests(current)) {
    let changed = false;
    const data = current.data.map((request) => {
      if (request.id !== requestId) return request;
      if ((request.unreadCount ?? 0) === 0) return request;
      changed = true;
      return { ...request, unreadCount: 0 };
    });
    if (!changed) return current;
    return { ...current, data };
  }

  if (isSupplyRequest(current)) {
    if (current.id !== requestId) return current;
    if ((current.unreadCount ?? 0) === 0) return current;
    return { ...current, unreadCount: 0 };
  }

  return current;
};

const isPaginatedRequests = (
  value: RequestsCacheValue
): value is PaginatedResponse<SupplyRequest> =>
  'data' in value && Array.isArray(value.data);

const isSupplyRequest = (value: RequestsCacheValue): value is SupplyRequest =>
  'id' in value && !('data' in value);

const hasUnreadForRequest = (
  lists: Array<[unknown, ChatListItem[] | undefined]>,
  requestCaches: Array<[unknown, RequestsCacheValue | undefined]>,
  requestId: string
): boolean => {
  const listHasUnread = lists.some(([, data]) =>
    data?.some((chat) => chat.requestId === requestId && (chat.unreadCount ?? 0) > 0)
  );
  if (listHasUnread) return true;

  return requestCaches.some(([, data]) => {
    if (!data) return false;
    if (isPaginatedRequests(data)) {
      return data.data.some(
        (request) => request.id === requestId && (request.unreadCount ?? 0) > 0
      );
    }
    return data.id === requestId && (data.unreadCount ?? 0) > 0;
  });
};
