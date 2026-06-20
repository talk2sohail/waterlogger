import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ReminderInit } from '@/components/layout/ReminderInit';
import { PwaInit } from '@/components/layout/PwaInit';

export const metadata: Metadata = {
  title: 'WaterLogger',
  description: 'Track your daily water intake',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const themeScript = `
(function() {
  try {
    var raw = localStorage.getItem('waterlogger:state');
    if (raw) {
      var state = JSON.parse(raw);
      var theme = state.settings && state.settings.theme;
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="text-gray-800 dark:text-gray-100 antialiased min-h-dvh transition-colors duration-300">
        <ThemeProvider>
          <ReminderInit />
          <PwaInit />
          <div className="mx-auto max-w-lg px-4 pb-8">
            <Header />
            <main className="mt-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
