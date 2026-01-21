import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-onest',
  fallback: ['arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'Pona Tech - Поставки промышленного оборудования в Россию',
    template: '%s | Pona Tech',
  },
  description:
    'PONA TECH — международные поставки промышленного и ИТ-оборудования. Прямые закупки от 70+ мировых брендов: Siemens, ABB, Schneider Electric, Cisco, Dell и других.',
  keywords: [
    'промышленное оборудование',
    'поставки из Китая',
    'Siemens',
    'ABB',
    'Schneider Electric',
    'автоматизация',
    'ИТ-оборудование',
  ],
  authors: [{ name: 'Pona Tech' }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Pona Tech',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${onest.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
