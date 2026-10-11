"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FileText, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF8] dark:bg-[#18181B] transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
              Syarat &amp; Ketentuan
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Terms of Service — MuaraKu (.id)
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Terakhir diperbarui: 11 Oktober 2026 • Versi 1.0
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                1. Penerimaan Ketentuan
              </h2>
              <p>
                Dengan mengakses atau menggunakan platform MuaraKu (melalui web `muaraku.id` atau layanan terkait), Anda menyetujui untuk terikat secara sah oleh Syarat dan Ketentuan ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                2. Larangan Klaim Palsu dan Penipuan (Anti-Fraud)
              </h2>
              <p>
                MuaraKu didirikan atas dasar integritas komunitas. Pengguna dilarang keras untuk:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-600 dark:text-zinc-400 text-sm">
                <li>Mengajukan klaim kepemilikan atas barang yang bukan miliknya secara sah.</li>
                <li>Meminta uang tebusan, imbalan paksa, atau biaya pengembalian yang tidak wajar.</li>
                <li>Mengunggah barang terlarang, narkotika, senjata, atau materi yang melanggar hukum RI.</li>
                <li>Menyalahgunakan fitur obrolan privat untuk pelecehan, spam, atau pengelabuan identitas.</li>
              </ul>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Pelanggaran terhadap poin ini akan mengakibatkan pemblokiran permanen akun dan dapat diteruskan ke pihak penegak hukum yang berwenang.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                3. Batasan Tanggung Jawab
              </h2>
              <p>
                MuaraKu bertindak sebagai sarana fasilitasi dan temu kembali. Kami menyarankan setiap pengguna untuk melakukan serah terima fisik di pos keamanan resmi, lobi umum kampus, atau kantor polisi terdekat demi keselamatan bersama. MuaraKu tidak bertanggung jawab atas kerugian fisik yang timbul dari kelalaian pengguna di luar pengawasan platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
