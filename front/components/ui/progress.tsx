import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = PROGRESS_MIN, ...props }, ref) => {
  const normalized = Math.min(Math.max(value ?? PROGRESS_MIN, PROGRESS_MIN), PROGRESS_MAX);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      value={normalized}
      max={PROGRESS_MAX}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${PROGRESS_MAX - normalized}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = 'Progress';

export { Progress };
