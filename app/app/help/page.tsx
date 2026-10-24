"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function InAppHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Bagaimana cara memverifikasi kepemilikan barang temuan?",
      a: "Buka laporan barang temuan di Finder atau Discover, lalu klik 'Klaim Kepemilikan'. Tuliskan bukti ciri khusus (nomor seri, ciri tersembunyi) yang hanya diketahui oleh pemilik asli. Bukti ini aman dan hanya dibuka kepada penemu.",
    },
    {
      q: "Mengapa barang saya belum muncul di hasil pencarian?",
      a: "Laporan yang baru diunggah melewati verifikasi anti-spam singkat. Pastikan judul dan deskripsi jelas agar mudah diindeks oleh pencarian natural language.",
    },
    {
      q: "Bagaimana cara mendapatkan tanda Petugas Lokasi Terverifikasi?",
      a: "Staf resmi kampus, satpam, atau pengelola ruang publik dapat mengajukan verifikasi melalui tim pengelola dengan menyerahkan bukti tugas resmi.",
    },
    {
      q: "Apakah aman menyerahkan barang secara langsung?",
      a: "Sangat dianjurkan untuk menyerahkan barang di pos petugas resmi, lobi umum kampus, atau kantor keamanan setempat.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Pusat Bantuan &amp; Panduan Warga
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Temukan jawaban seputar tata cara temu kembali, etika komunitas, dan bantuan teknis.
        </p>
      </div>

      {/* Safety Card */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Etika Transparansi MuaraKu:</strong> Seluruh proses temu kembali berlandaskan gotong royong sipil. Dilarang keras menuntut uang tebusan atau memaksa imbalan.
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 px-1">
          Pertanyaan Populer
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-orange-500"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform ${
                      isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* External Links Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Perlu Bantuan Lanjutan dari Tim Pengelola?
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Kunjungi halaman dukungan resmi untuk mengirimkan tiket kendala.
          </p>
        </div>

        <Link
          href="/support"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <span>Buka Pusat Bantuan Lengkap</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
