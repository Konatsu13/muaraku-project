import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MuaraKu — Titik Temu Bagi yang Terpisah",
  description: "Platform lost and found komunitas dan kampus terpercaya di Indonesia.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("muaraku_theme")||"system";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(t==="system"&&d)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col text-zinc-900 dark:text-zinc-100 bg-[#FFFCF8] dark:bg-[#18181B] selection:bg-orange-500/20 selection:text-orange-600">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
