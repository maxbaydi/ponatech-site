'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MessageCircle, Mail, Building2, Hash } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatMessagesList } from './chat-messages-list';
import { ChatInput } from './chat-input';
import { useChatMessages, useSendMessage, useMarkChatAsRead } from '@/lib/hooks/use-chat';
import { useAuth } from '@/lib/auth/auth-context';
import type { ChatMessage, SupplyRequest } from '@/lib/api/types';
import { formatRequestNumber } from '@/lib/requests/request-number';

interface RequestChatProps {
  request: SupplyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestChat({ request, open, onOpenChange }: RequestChatProps) {
  const { user } = useAuth();
  const { data: messagesData, isLoading } = useChatMessages(request?.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const lastMarkedRef = useRef<{ requestId: string; unreadCount: number; lastAttemptAt: number } | null>(null);

  const messages = messagesData?.data ?? [];
  const requestId = request?.id ?? null;

  const isManager = useMemo(
    () => Boolean(user && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)),
    [user]
  );

  const unreadMessagesCount = useMemo(() => {
    if (!requestId) return 0;
    const targetSenders = isManager ? ['CUSTOMER'] : ['MANAGER', 'SYSTEM'];
    return messages.reduce((count, message) => {
      if (!message.isRead && targetSenders.includes(message.senderType)) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [messages, isManager, requestId]);

  const tryMarkAsRead = useCallback(() => {
    if (!open || !requestId) return;
    if (unreadMessagesCount <= 0) {
      lastMarkedRef.current = {
        requestId,
        unreadCount: 0,
        lastAttemptAt: Date.now(),
      };
      return;
    }
    if (markAsRead.isPending) return;

    if (typeof document !== 'undefined') {
      const isVisible = document.visibilityState === 'visible';
      const hasFocus = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
      if (!isVisible || !hasFocus) return;
    }

    const now = Date.now();
    const lastAttempt = lastMarkedRef.current;
    if (
      lastAttempt &&
      lastAttempt.requestId === requestId &&
      lastAttempt.unreadCount === unreadMessagesCount &&
      now - lastAttempt.lastAttemptAt < 4000
    ) {
      return;
    }

    lastMarkedRef.current = {
      requestId,
      unreadCount: unreadMessagesCount,
      lastAttemptAt: now,
    };
    markAsRead.mutate(requestId);
  }, [open, requestId, unreadMessagesCount, markAsRead, markAsRead.isPending]);

  useEffect(() => {
    tryMarkAsRead();
  }, [tryMarkAsRead]);

  useEffect(() => {
    if (!open || !requestId) return;
    const handleVisibility = () => tryMarkAsRead();
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [open, requestId, tryMarkAsRead]);

  const handleSend = useCallback(
    (content: string, files: File[]) => {
      if (!request?.id) return;

      sendMessage.mutate({
        data: { requestId: request.id, content },
        files: files.length > 0 ? files : undefined,
      });
    },
    [request?.id, sendMessage]
  );

  const isCurrentUserSender = useCallback(
    (message: ChatMessage): boolean => {
      if (!user) return false;

      const isManager = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

      if (isManager) {
        return message.senderType === 'MANAGER' && !!message.senderId && message.senderId === user.id;
      }

      return message.senderType === 'CUSTOMER';
    },
    [user]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 overscroll-contain">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Чат по заявке</SheetTitle>
          {request && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">
                  {formatRequestNumber(request.requestNumber, false)}
                </span>
              </div>
              {isManager && (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{request.email}</span>
                  </div>
                  {request.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span>{request.company}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </SheetHeader>

        <ChatMessagesList
          messages={messages}
          isLoading={isLoading}
          isCurrentUserSender={isCurrentUserSender}
        />

        <ChatInput
          onSend={handleSend}
          disabled={sendMessage.isPending}
          placeholder="Введите сообщение..."
        />
      </SheetContent>
    </Sheet>
  );
}
