import { cn } from '@/lib/utils';

const INITIALS_LEN = 2;

const SIZE_STYLES = {
  sm: {
    container: 'w-10 h-10 rounded-lg',
    image: 'w-8 h-8',
    fallbackText: 'text-xs',
  },
  md: {
    container: 'w-16 h-16 rounded-xl',
    image: 'w-20 h-20',
    fallbackText: 'text-lg',
  },
  lg: {
    container: 'w-24 h-24 rounded-2xl',
    image: 'w-16 h-16',
    fallbackText: 'text-2xl',
  },
} as const;

export type BrandLogoSize = keyof typeof SIZE_STYLES;

interface BrandLogoProps {
  name: string;
  src?: string | null;
  size?: BrandLogoSize;
  className?: string;
  imgClassName?: string;
}

export function BrandLogo({ name, src, size = 'md', className, imgClassName }: BrandLogoProps) {
  const initials = name.slice(0, INITIALS_LEN).toUpperCase();
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        styles.container,
        'bg-white flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className={cn(styles.image, 'object-contain', imgClassName)} />
      ) : (
        <span className={cn(styles.fallbackText, 'font-bold text-muted-foreground')}>{initials}</span>
      )}
    </div>
  );
}

