"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, Heart, Sparkles, HelpCircle, Users, ExternalLink, Waves } from "lucide-react";
import {
  getCompleteDevelopers,
  isSafeSocialUrl,
  type DeveloperProfile,
} from "@/lib/config/developers";

function DeveloperCard({ developer }: { developer: DeveloperProfile }) {
  return (
    <article className="p-5 rounded-xl bg-surface border border-subtle space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* 1:1 Aspect Ratio Photo Frame */}
        <div className="aspect-square w-full rounded-lg overflow-hidden bg-canvas border border-subtle flex items-center justify-center">
          {developer.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={developer.photo}
              alt={`Foto profil ${developer.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-secondary-text">
              <Users className="w-10 h-10" />
              <span className="text-[10px] font-medium">Foto Tim</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold truncate">
            {developer.name}
          </h3>
          <p className="text-xs font-semibold text-secondary-text">{developer.role}</p>
        </div>
      </div>

      {(isSafeSocialUrl(developer.linkedinUrl) || isSafeSocialUrl(developer.instagramUrl)) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-subtle dark:border-zinc-800">
          {isSafeSocialUrl(developer.linkedinUrl) && (
            <a
              href={developer.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn ${developer.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas border border-subtle hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {isSafeSocialUrl(developer.instagramUrl) && (
            <a
              href={developer.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${developer.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas border border-subtle hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default function AboutPage() {
  const team = getCompleteDevelopers();

  return (
    <div className="min-h-screen flex flex-col bg-canvas dark:bg-[#18181B] bg-page-gradient transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              Titik Temu bagi yang Terpisah.
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Tentang MuaraKu — muara bagi barang yang berkelana: inisiatif platform sipil terpercaya untuk mengatasi kecemasan kehilangan barang dan risiko penipuan klaim di Indonesia.
            </p>
          </div>

          {/* Section: Filosofi "Muara" */}
          <div className="rounded-xl bg-surface border border-subtle p-8 sm:p-10 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Waves className="w-5 h-5 text-trust" aria-hidden />
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
            <h2 className="text-2xl font-bold">
              Prinsip Pokok Pengembangan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start">
              <div className="py-6 md:py-2 md:pl-0 md:pr-8 space-y-3 border-t md:border-t-0 border-subtle md:border-r border-subtle">
                <ShieldCheck className="w-5 h-5 text-secondary-text" aria-hidden />
                <h3 className="text-sm font-semibold">
                  Trust Before Virality
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Kami memprioritaskan keamanan identitas dan pencegahan klaim palsu di atas sekadar mengejar metrik keramaian media sosial.
                </p>
              </div>

              <div className="py-6 md:py-2 md:px-8 space-y-3 border-t md:border-t-0 border-subtle">
                <Sparkles className="w-5 h-5 text-secondary-text" aria-hidden />
                <h3 className="text-sm font-semibold">
                  AI Membantu, Manusia Memutuskan
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Kecerdasan buatan menyarankan kecocokan dan mempermudah pencarian, tetapi bukti kepemilikan selalu diverifikasi oleh manusia.
                </p>
              </div>

              <div className="py-6 md:py-2 md:pl-8 md:border-l border-subtle space-y-3 border-t md:border-t-0">
                <Heart className="w-5 h-5 text-secondary-text" aria-hidden />
                <h3 className="text-sm font-semibold">
                  Gotong Royong Komunitas
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Didukung oleh jaringan mahasiswa, petugas keamanan kampus, dan pengelola ruang publik yang terverifikasi di kota maupun kampung masing-masing.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Tim Developer — Tiga Kartu Developer */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Pengembang di Balik MuaraKu
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                MuaraKu dibangun oleh tiga pengembang independen yang berdedikasi membangun platform temu kembali barang yang transparan dan aman bagi masyarakat Indonesia.
              </p>
            </div>

            {team.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {team.map((developer, idx) => (
                  <DeveloperCard key={developer.name || idx} developer={developer} />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-surface border border-dashed border-subtle text-center space-y-3">
                <Users className="w-8 h-8 mx-auto text-secondary-text" />
                <h3 className="text-base font-bold">
                  Profil Tiga Pengembang Segera Hadir
                </h3>
                <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed">
                  Data nama, foto, peran, dan tautan sosial tiga pengembang sedang disiapkan oleh pemilik proyek di konfigurasi pengembang. Kami tidak menyajikan profil palsu atau identitas buatan.
                </p>
              </div>
            )}
          </section>

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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-[#231206] text-sm font-bold rounded-xl transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Pusat Bantuan &amp; Dukungan</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
