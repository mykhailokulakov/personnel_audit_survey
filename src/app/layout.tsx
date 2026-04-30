import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Діагностична анкета',
  description: 'Інтерактивна діагностична анкета для оцінки професійного профілю',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
