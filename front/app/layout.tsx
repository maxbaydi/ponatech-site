import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Pona Tech - Поставки промышленного оборудования из Китая',
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
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
