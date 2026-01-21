import { Package } from 'lucide-react';

interface ImageCanvasProps {
  src?: string | null;
  alt?: string;
  className?: string;
  showPlaceholder?: boolean;
}

export function ImageCanvas({ src, alt = '', className = '', showPlaceholder = true }: ImageCanvasProps) {
  return (
    <div
      className={`relative w-full bg-white ${className}`}
      style={{ aspectRatio: '4/3' }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain"
        />
      ) : showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-16 h-16 text-muted-foreground/30" />
        </div>
      ) : null}
    </div>
  );
}
