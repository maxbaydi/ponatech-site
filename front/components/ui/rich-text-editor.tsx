'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link2, List, ListOrdered, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange: (html: string) => void;
  className?: string;
}

const PROSE_MIRROR_CLASSNAME = 'rich-text min-h-32 p-3 text-sm focus:outline-none';

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: PROSE_MIRROR_CLASSNAME,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className={cn('border rounded-md bg-background p-3 text-sm text-muted-foreground', className)}>
        Загрузка редактора…
      </div>
    );
  }

  return (
    <div className={cn('border rounded-md bg-background', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Жирный текст"
          aria-pressed={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Курсив"
          aria-pressed={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Маркированный список"
          aria-pressed={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Нумерованный список"
          aria-pressed={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            const url = window.prompt('URL');
            if (!url) return;
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          aria-label="Добавить ссылку"
          aria-pressed={editor.isActive('link')}
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!editor.isActive('link')}
          onClick={() => editor.chain().focus().unsetLink().run()}
          aria-label="Удалить ссылку"
        >
          <Unlink className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
