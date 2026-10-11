"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ReportCard } from "@/components/reports/ReportCard";
import { initialSampleReports } from "@/lib/data/sampleReports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Lock,
  UserCheck,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { openAuthModal } = useAuth();
  const { t } = useI18n();
  const [feedFilter, setFeedFilter] = useState<"all" | "lost" | "found">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredReports = initialSampleReports.filter((r) => {
    if (feedFilter === "lost") return r.type === "lost";
    if (feedFilter === "found") return r.type === "found";
    return true;
  });

  const faqs = [
    {
      q: t.landing.faq_1_q,
      a: t.landing.faq_1_a,
    },
    {
      q: t.landing.faq_2_q,
      a: t.landing.faq_2_a,
    },
    {
      q: t.landing.faq_3_q,
      a: t.landing.faq_3_a,
    },
    {
      q: "Bagaimana jika saya menemukan barang di stasiun atau kampus?",
      a: "Anda dapat menyerahkannya ke posko keamanan atau petugas terverifikasi. Petugas akan menandai barang dengan badge kuning resmi agar pemilik lebih mudah mempercayai alur pengembalian.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF8] dark:bg-[#18181B] transition-colors">
      <PublicNavbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Civic Trust Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.landing.hero_badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.12]">
                  {t.landing.hero_title}
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  {t.landing.hero_desc}
                </p>

                {/* Main Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>{t.landing.cta_lost}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-6 py-3.5 bg-white dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-semibold rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{t.landing.cta_found}</span>
                  </button>

                  <Link
                    href="/app"
                    className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Jelajahi Feed</span>
                  </Link>
                </div>

                {/* Community Metrics Pills */}
                <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verifikasi Bukti Anti-Fraud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    <span>Brankas Data Privat Enkripsi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>Pencarian Bahasa Alami (N2L)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card (AI Match Simulation) */}
              <div className="lg:col-span-5 relative">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200/80 dark:border-zinc-800 relative z-10">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Live Match Radar
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      88% Cocok
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* Simulated Lost Post */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-rose-500">Laporan Kehilangan</span>
                        <span className="text-zinc-400">4 jam lalu</span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Dompet Kulit Cokelat Braun Buffel
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Lokasi: Perpustakaan Pusat Lt. 2 Meja 14
                      </p>
                    </div>

                    {/* Central Indicator */}
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Simulated Found Post */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-emerald-600">Laporan Ditemukan</span>
                        <span className="text-zinc-400">1 jam lalu</span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Dompet Lipat Kulit Pria Merk BB
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Diserahkan ke: Petugas Keamanan Meja Informasi
                      </p>
                    </div>

                    {/* Next step notice */}
                    <div className="pt-2">
                      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>Kuis kepemilikan privat melindungi barang dari klaim palsu sebelum nomor kontak dibuka.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -top-6 -right-6 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="py-20 bg-white dark:bg-[#121214] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                {t.landing.how_it_works_badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {t.landing.how_it_works_title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Sistem transparan yang menjaga rasa aman pemilik dan penemu di setiap langkah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.step1_title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.step1_desc}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.step2_title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.step2_desc}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.step3_title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.step3_desc}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.step4_title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.step4_desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COMMUNITY PREVIEW FEED ================= */}
        <section className="py-20 bg-[#FFFCF8] dark:bg-[#18181B] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  {t.landing.feed_preview_badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2">
                  {t.landing.feed_preview_title}
                </h2>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                <button
                  onClick={() => setFeedFilter("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "all"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_all}
                </button>
                <button
                  onClick={() => setFeedFilter("lost")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "lost"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_lost}
                </button>
                <button
                  onClick={() => setFeedFilter("found")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "found"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_found}
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.slice(0, 6).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onChatClick={() => openAuthModal("login")}
                />
              ))}
            </div>

            {/* View Full Discover Button */}
            <div className="mt-12 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <span>Buka Seluruh Discover Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= TRUST & SAFETY ================= */}
        <section className="py-20 bg-white dark:bg-[#121214] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                {t.landing.trust_badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {t.landing.trust_title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.trust_1_title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.trust_1_desc}
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.trust_2_title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.trust_2_desc}
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.landing.trust_3_title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.landing.trust_3_desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION ================= */}
        <section className="py-20 bg-[#FFFCF8] dark:bg-[#18181B] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {t.landing.faq_title}
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-orange-500 transition-colors"
                    >
                      <span className="text-base">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-orange-500" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA BANNER ================= */}
        <section className="py-20 bg-orange-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t.landing.cta_final_title}
            </h2>
            <p className="text-base sm:text-lg text-orange-100 max-w-xl mx-auto">
              {t.landing.cta_final_desc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => openAuthModal("register")}
                className="px-8 py-4 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg hover:shadow-xl text-base transition-all transform hover:-translate-y-0.5"
              >
                {t.landing.cta_final_button}
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
