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
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M7 19C5.34315 19 4 20.3431 4 22C4 23.6569 5.34315 25 7 25C8.65685 25 10 23.6569 10 22L12.5 13.5L16 20.5L19.5 13.5L22 22C22 23.6569 23.3431 25 25 25C26.6569 25 28 23.6569 28 22C28 20.3431 26.6569 19 25 19' stroke='%23FB923C' stroke-width='2.75' stroke-linecap='round' stroke-linejoin='round'/><circle cx='16' cy='7.5' r='3' stroke='%23FB923C' stroke-width='2.5'/><path d='M13.5 13C14.2 11.8 15 11 16 11C17 11 17.8 11.8 18.5 13' stroke='%23FB923C' stroke-width='2' stroke-linecap='round'/></svg>",
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
