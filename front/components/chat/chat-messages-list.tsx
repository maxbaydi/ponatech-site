'use client';

import { Fragment, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMessageItem } from './chat-message-item';
import type { ChatMessage } from '@/lib/api/types';

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isCurrentUserSender: (message: ChatMessage) => boolean;
}

export function ChatMessagesList({
  messages,
  isLoading = false,
  isCurrentUserSender,
}: ChatMessagesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Загрузка…</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Нет сообщений. Начните диалог!</p>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 pt-0 pb-4 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="chat-text-container relative -me-4 flex min-h-0 flex-1 flex-col overflow-y-hidden">
          <div
            ref={scrollRef}
            className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto scrollbar-invisible py-2 pe-4 pb-4"
            role="log"
            aria-relevant="additions"
            aria-live="polite"
          >
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <Fragment key={date}>
                <div className="flex justify-center my-2">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                {dateMessages.map((msg, index) => (
                  <ChatMessageItem
                    key={`${date}-${msg.id ?? msg.createdAt}-${index}`}
                    message={msg}
                    isCurrentUser={isCurrentUserSender(msg)}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
  const groups: Record<string, ChatMessage[]> = {};
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const message of sortedMessages) {
    const date = new Date(message.createdAt);
    const dateKey = formatDateKey(date);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  }

  return groups;
}

function formatDateKey(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Сегодня';
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Вчера';
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
