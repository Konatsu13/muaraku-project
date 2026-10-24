"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  HelpCircle,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Search,
} from "lucide-react";

export default function SupportPage() {
  const [topic, setTopic] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF8] dark:bg-[#18181B] transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
              Pusat Dukungan &amp; Bantuan
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Ada yang Bisa Kami Bantu?
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Pelajari panduan keamanan serah terima, laporkan masalah teknis, atau hubungi tim moderasi MuaraKu.
            </p>
          </div>

          {/* Safety Guidelines Card */}
          <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <h2 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                Panduan Penting Serah Terima Barang Aman
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed list-disc list-inside">
              <li>Lakukan pertemuan di tempat umum yang ramai (lobi kampus, posko keamanan, pos polisi).</li>
              <li>Jangan pernah mengirimkan uang tebusan atau transfer biaya sebelum barang diperiksa langsung.</li>
              <li>Selalu verifikasi bukti kepemilikan (nomor seri, ciri tersembunyi) sebelum menyerahkan barang.</li>
              <li>Gunakan fitur pesan MuaraKu agar percakapan terdokumentasi dan terlindungi.</li>
            </ul>
          </div>

          {/* Support Ticket Submission Form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Kirim Tiket / Pesan Bantuan
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  Tiket Berhasil Dikirimkan
                </div>
                <p className="text-sm">
                  Terima kasih, tim moderasi dan dukungan MuaraKu akan meninjau pesan Anda dan merespons via email dalam 1x24 jam kerja.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Kategori Kendala
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="general">Pertanyaan Umum</option>
                    <option value="scam">Laporan Dugaan Penipuan / Pelanggaran</option>
                    <option value="account">Bantuan Akun &amp; OTP</option>
                    <option value="staff_verification">Pengajuan Petugas Lokasi Terverifikasi</option>
                    <option value="bug">Laporan Masalah Sistem (Bug)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Pesan / Rincian Laporan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan kendala Anda secara rinci..."
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Tiket Bantuan</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
