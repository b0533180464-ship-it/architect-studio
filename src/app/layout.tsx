import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Architect Studio',
  description: 'מערכת לניהול משרדי אדריכלות ועיצוב פנים',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
