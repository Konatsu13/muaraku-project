import type { Metadata } from 'next';
import '../index.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { ModalProvider } from '../context/ModalContext';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'MuaraKu — Titik Temu Barang Hilang & Ditemukan Terpercaya',
  description: 'Platform cerdas sekolah untuk menemukan dan mengembalikan barang hilang dengan aman dan terverifikasi.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-warm-canvas text-on-surface antialiased min-h-screen selection:bg-primary-container/20 selection:text-primary">
        <ToastProvider>
          <AuthProvider>
            <ModalProvider>
              <AppShell>
                {children}
              </AppShell>
            </ModalProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
