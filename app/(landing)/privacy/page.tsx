"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas dark:bg-[#18181B] transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
              Kebijakan Privasi
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Privacy Policy — MuaraKu (.id)
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Terakhir diperbarui: 11 Oktober 2026 • Versi 1.0 (Ditinjau untuk kepatuhan PDP Indonesia)
            </p>
          </div>

          {/* Privacy Pillars Alert */}
          <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 flex items-start gap-3">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-orange-900 dark:text-orange-200 leading-relaxed">
              <strong>Prinsip Privacy by Default:</strong> Bukti kepemilikan privat (nomor seri, ciri tersembunyi, tanda pengenal) TIDAK AKAN PERNAH dipublikasikan secara umum. Informasi rahasia ini hanya tersimpan di brankas terenkripsi server kami untuk proses verifikasi klaim.
            </div>
          </div>

          {/* Policy Content Sections */}
          <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                1. Data yang Kami Kumpulkan
              </h2>
              <p>
                MuaraKu mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar akun dan membuat laporan:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-600 dark:text-zinc-400 text-sm">
                <li><strong>Informasi Akun:</strong> Alamat email, nama tampilan, dan kata sandi yang di-hash dengan enkripsi industri.</li>
                <li><strong>Data Laporan Publik:</strong> Nama barang, kategori, estimasi tanggal/waktu, lokasi perkiraan umum, dan foto tampak visual.</li>
                <li><strong>Data Verifikasi Privat:</strong> Ciri unik tersembunyi atau dokumen bukti kepemilikan yang Anda masukkan secara khusus di kolom rahasia.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                2. Penggunaan Kecerdasan Buatan (AI)
              </h2>
              <p>
                Layanan AI kami (Natural Language Search dan AI Matching) hanya memproses teks dan fitur visual untuk memfasilitasi penemuan kandidat laporan yang cocok. <strong>AI tidak pernah membagikan data bukti kepemilikan rahasia ke pihak ketiga</strong> dan tidak mengambil keputusan otomatis mengenai status hukum kepemilikan barang.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                3. Penyimpanan dan Keamanan Data
              </h2>
              <p>
                Basis data kami dioperasikan melalui infrastruktur PostgreSQL Supabase dengan Row Level Security (RLS) ketat. Media gambar bukti klaim disimpan pada bucket privat terisolasi yang hanya dapat diakses oleh pihak yang berwenang.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                4. Hak Pengguna
              </h2>
              <p>
                Anda berhak menghapus atau menyunting laporan Anda kapan saja setelah proses serah terima selesai, serta mengajukan penutupan akun melalui halaman Pengaturan atau email dukungan resmi.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
