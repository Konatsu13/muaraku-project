"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck } from "lucide-react";

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-white dark:bg-[#121214] border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-100 dark:border-zinc-800/80">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center p-1.5 border border-orange-500/20">
                <Image
                  src="/logo.svg"
                  alt="MuaraKu Logo"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                MuaraKu (.id)
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Titik temu bagi yang terpisah, muara bagi barang yang berkelana. Ekosistem pencarian barang hilang yang aman, terverifikasi, dan bebas penipuan untuk masyarakat Indonesia.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verifikasi kepemilikan anti-fraud &amp; enkripsi privasi pengguna.</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-500 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-orange-500 transition-colors">
                  {t.nav.support}
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-orange-500 transition-colors">
                  Aplikasi MuaraKu
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Ketentuan &amp; Komunitas
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-orange-500 transition-colors">
                  Panduan Keamanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Exact Copyright & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 MuaraKu. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200 underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-200 underline-offset-4 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
