'use client';

interface RequestMessageProps {
  label: string;
  message: string;
}

const MESSAGE_CONTAINER_CLASS = 'mt-2 max-h-56 overflow-y-auto rounded-md border p-3 scrollbar-themed';
const MESSAGE_TEXT_CLASS = 'text-sm whitespace-pre-wrap';

export function RequestMessage({ label, message }: RequestMessageProps) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={MESSAGE_CONTAINER_CLASS}>
        <div className={MESSAGE_TEXT_CLASS}>{message}</div>
      </div>
    </div>
  );
}
