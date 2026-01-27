'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, Search, MessagesSquare, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { ChatMessagesList } from '@/components/chat/chat-messages-list';
import { ChatInput } from '@/components/chat/chat-input';
import { useChatList, useChatMessages, useSendMessage, useMarkChatAsRead, useChatStats } from '@/lib/hooks/use-chat';
import { cn } from '@/lib/utils';
import type { ChatListItem, ChatMessage } from '@/lib/api/types';

const PAGE_TITLE = 'Чаты';
const SEARCH_PLACEHOLDER = 'Поиск по номеру заявки…';
const EMPTY_CHATS_MESSAGE = 'Нет активных чатов';
const SELECT_CHAT_MESSAGE = 'Выберите чат для просмотра сообщений';
const MISSING_CHAT_MESSAGE = 'Чат не найден или доступ ограничен';
const NO_MESSAGES_PREVIEW = 'Диалог ещё не начат';
const BACK_TO_LIST_LABEL = 'К списку чатов';

export default function AdminChatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestParam = searchParams.get('request');

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const lastMarkedRequestRef = useRef(new Map<string, { unreadCount: number; lastAttemptAt: number }>());
  const recentlySentRequestIdRef = useRef<string | null>(null);

  const { data: chats, isLoading: isLoadingChats } = useChatList(requestParam ?? undefined);
  const { data: stats } = useChatStats();
  const { data: messagesData, isLoading: isLoadingMessages } = useChatMessages(selectedChatId ?? undefined);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();

  useEffect(() => {
    if (requestParam) {
      setSelectedChatId(requestParam);
    }
  }, [requestParam]);

  const selectedChat = chats?.find((chat) => chat.requestId === selectedChatId);
  const messages = messagesData?.data ?? [];
  const unreadCount = selectedChat?.unreadCount ?? 0;
  const requestIdToMark = selectedChat?.requestId;

  useEffect(() => {
    if (!selectedChatId || !requestIdToMark) return;
    if (unreadCount <= 0) {
      lastMarkedRequestRef.current.delete(requestIdToMark);
      return;
    }
    if (markAsRead.isPending || recentlySentRequestIdRef.current === requestIdToMark) {
      return;
    }
    const now = Date.now();
    const lastMarked = lastMarkedRequestRef.current.get(requestIdToMark);
    if (lastMarked && lastMarked.unreadCount === unreadCount && now - lastMarked.lastAttemptAt < 5000) {
      return;
    }
    lastMarkedRequestRef.current.set(requestIdToMark, {
      unreadCount,
      lastAttemptAt: now,
    });
    markAsRead.mutate(requestIdToMark);
  }, [selectedChatId, requestIdToMark, unreadCount]);

  const filteredChats = useMemo(() => {
    if (!chats) return [];
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) =>
      chat.requestNumber.toLowerCase().includes(query) ||
      chat.customerName.toLowerCase().includes(query) ||
      chat.customerEmail.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  const handleSelectChat = (chat: ChatListItem) => {
    setSelectedChatId(chat.requestId);

    const params = new URLSearchParams(searchParams.toString());
    if (params.get('request') !== chat.requestId) {
      params.set('request', chat.requestId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('request');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const handleSend = (content: string, files: File[]) => {
    if (!selectedChatId) return;

    recentlySentRequestIdRef.current = selectedChatId;
    setTimeout(() => {
      recentlySentRequestIdRef.current = null;
    }, 3000);

    sendMessage.mutate({
      data: { requestId: selectedChatId, content },
      files: files.length > 0 ? files : undefined,
    });
  };

  const isCurrentUserSender = (message: ChatMessage): boolean => {
    return message.senderType === 'MANAGER';
  };

  const isMissingChat = !!selectedChatId && !selectedChat && !isLoadingChats;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden sm:flex-row sm:gap-6">
      <div
        className={cn(
          'flex w-full min-h-0 flex-col gap-1.5 px-1.5 sm:w-56 lg:w-72 2xl:w-80',
          selectedChatId && 'hidden sm:flex',
          !selectedChatId && 'flex-1 sm:flex-initial'
        )}
      >
        <div className="sticky top-0 z-10 -mx-4 shrink-0 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
              <MessagesSquare size={20} />
              {stats && stats.unreadChats > 0 && (
                <Badge variant="destructive" className="ml-1">{stats.unreadChats}</Badge>
              )}
            </div>
          </div>

          <label
            className={cn(
              'focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden',
              'flex h-10 w-full items-center gap-0 space-x-0 rounded-md border border-border ps-2.5'
            )}
          >
            <Search size={15} className="me-2 stroke-slate-500" />
            <span className="sr-only">{SEARCH_PLACEHOLDER}</span>
            <input
              type="text"
              className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
              placeholder={SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <ScrollArea className="-mx-3 min-h-0 flex-1 p-3 sm:h-full">
          {isLoadingChats ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {EMPTY_CHATS_MESSAGE}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const unreadCount = chat.unreadCount ?? 0;
              return (
                <Fragment key={chat.requestId}>
                  <button
                    type="button"
                    className={cn(
                      'group hover:bg-muted',
                      'flex w-full items-start justify-between gap-2 rounded-md px-2 py-2 text-start text-sm',
                      selectedChatId === chat.requestId && 'bg-muted'
                    )}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block">
                        {chat.requestNumber}
                      </span>
                      <span className="text-muted-foreground text-xs block">
                        {chat.customerName}
                      </span>
                      <span className="line-clamp-2 text-ellipsis text-muted-foreground">
                        {chat.lastMessage || NO_MESSAGES_PREVIEW}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <RequestStatusBadge status={chat.status} />
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="min-w-5 h-5 px-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                  <Separator className="my-1" />
                </Fragment>
              );
            })
          )}
        </ScrollArea>
      </div>

      <div
        className={cn(
          'flex w-full flex-1 flex-col rounded-md border bg-background shadow-sm overflow-hidden min-h-0',
          !selectedChatId && 'hidden sm:flex'
        )}
      >
        {isMissingChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p>{MISSING_CHAT_MESSAGE}</p>
            </div>
          </div>
        ) : selectedChat ? (
          <>
            <div className="mb-1 flex flex-none shrink-0 items-center justify-between gap-2 bg-card p-3 shadow-lg sm:rounded-t-md sm:p-4">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="shrink-0 sm:hidden"
                  aria-label={BACK_TO_LIST_LABEL}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium lg:text-base block truncate">
                    {selectedChat.requestNumber}
                  </span>
                  <span className="text-xs text-muted-foreground lg:text-sm block truncate">
                    {selectedChat.customerName}
                  </span>
                </div>
              </div>
              <RequestStatusBadge status={selectedChat.status} className="shrink-0" />
            </div>

            <ChatMessagesList
              messages={messages}
              isLoading={isLoadingMessages}
              isCurrentUserSender={isCurrentUserSender}
            />

            <div className="shrink-0">
              <ChatInput
                onSend={handleSend}
                disabled={sendMessage.isPending}
                placeholder="Введите ответ клиенту…"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center rounded-md border bg-card shadow-sm">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
                <MessagesSquare className="size-8" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">{PAGE_TITLE}</h2>
                <p className="text-sm text-muted-foreground">
                  {SELECT_CHAT_MESSAGE}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
