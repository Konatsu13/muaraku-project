"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, ArrowRight, Heart, Sparkles, HelpCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF8] dark:bg-[#18181B] transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
              Tentang MuaraKu (.id)
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              Titik Temu Bagi yang Terpisah, Muara Bagi Barang yang Berkelana.
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Sebuah inisiatif platform sipil terpercaya yang dirancang untuk mengatasi kecemasan kehilangan barang dan risiko penipuan klaim di Indonesia.
            </p>
          </div>

          {/* Section: Filosofi "Muara" */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-bold">
                🌊
              </span>
              Filosofi di Balik Nama “MuaraKu”
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Dalam geografi nusantara, <strong>muara</strong> adalah muara sungai—tempat di mana berbagai arus air dari hulu yang berbeda bertemu dengan tenang dan menyatu sebelum mencapai lautan bebas.
              </p>
              <p>
                Kami mengambil metafora ini sebagai pondasi produk: ketika seseorang kehilangan barang berharga dan orang lain menemukannya di sudut kota atau kampus, kedua jalur yang terpisah ini membutuhkan <strong>tempat pertemuan yang aman, tenang, dan dapat diandalkan</strong>. MuaraKu hadir sebagai muara tersebut.
              </p>
            </div>
          </div>

          {/* Section: Prinsip Produk */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Prinsip Pokok Pengembangan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Trust Before Virality
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Kami memprioritaskan keamanan identitas dan pencegahan klaim palsu di atas sekadar mengejar metrik keramaian media sosial.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  AI Membantu, Manusia Memutuskan
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Kecerdasan buatan menyarankan kecocokan dan mempermudah pencarian, tetapi bukti kepemilikan selalu diverifikasi oleh manusia.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Gotong Royong Komunitas
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Didukung oleh jaringan mahasiswa, petugas keamanan kampus, dan pengelola ruang publik yang terverifikasi.
                </p>
              </div>
            </div>
          </div>

          {/* Section: CTA Navigasi */}
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Pusat Bantuan &amp; Dukungan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
