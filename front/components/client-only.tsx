'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ClientOnlyProps = {
  children: ReactNode;
  placeholder?: ReactNode;
};

export function ClientOnly({ children, placeholder = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{placeholder}</>;
  return <>{children}</>;
}
