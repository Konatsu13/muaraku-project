"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonFeed } from "@/components/ui/patterns/LoadingPattern";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Lock,
  MapPin,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { openAuthModal } = useAuth();
  const { locale } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q:
        locale === "en"
          ? "Are there any ransom or finding fees?"
          : "Apakah ada biaya tebusan atau pungutan biaya saat barang ditemukan?",
      a:
        locale === "en"
          ? "Absolutely not. MuaraKu operates on principles of community trust and integrity. Any user demanding ransom or unauthorized fees can be reported and will be permanently banned."
          : "Sama sekali tidak ada. MuaraKu beroperasi atas dasar prinsip ketulusan komunitas dan integritas layanan publik. Siapapun yang meminta biaya tebusan atau transfer dapat langsung dilaporkan dan akunnya akan diblokir permanen.",
    },
    {
      q:
        locale === "en"
          ? "How is ownership verified without revealing secret item details?"
          : "Bagaimana cara memverifikasi pemilik tanpa membocorkan ciri rahasia?",
      a:
        locale === "en"
          ? "When submitting a found item, the finder conceals 1–2 specific details (e.g. keychain color inside, pocket contents). The seeker answers private verification questions without the answers ever being published."
          : "Saat melaporkan barang temuan, penemu menyembunyikan 1–2 detail spesifik (misal warna gantungan kunci di saku dalam). Ketika pencari mengajukan klaim, sistem menyajikan kuis verifikasi privat tanpa membocorkan ciri tersebut ke publik.",
    },
    {
      q:
        locale === "en"
          ? "Who can register as a verified partner?"
          : "Siapa saja mitra lokasi terverifikasi?",
      a:
        locale === "en"
          ? "Verified partners include university campus staff, public transit officers, library administrators, and certified building security desks."
          : "Mitra resmi mencakup loket kampus perguruan tinggi negeri & swasta terdaftar, petugas stasiun, pengelola halte, serta tim keamanan gedung publik terverifikasi.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-main-text selection:bg-orange-500/20 selection:text-orange-600 transition-colors">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <Badge variant="verified" size="md" className="gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-xs tracking-wide uppercase">
                  {locale === "en"
                    ? "Community Lost & Found"
                    : "Ekosistem Lost & Found Terpercaya"}
                </span>
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
                {locale === "en" ? (
                  <>
                    A safe meeting point for what has been{" "}
                    <span className="text-[#FB923C]">separated.</span>
                  </>
                ) : (
                  <>
                    Titik temu bagi yang{" "}
                    <span className="text-[#FB923C]">terpisah.</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
                {locale === "en"
                  ? "A modern community platform for reporting, discovering, and verifying lost items safely across Indonesian campuses and public spaces — free from ransoms and scams."
                  : "Platform komunitas modern untuk melaporkan, mencari, dan memverifikasi barang hilang secara aman di lingkungan kampus dan ruang publik Indonesia — bebas penipuan dan tanpa tebusan."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/app/seeker">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    {locale === "en" ? "Search Lost Items" : "Cari Barang Hilang"}
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => openAuthModal("login")}
                  leftIcon={<PlusCircle className="w-4 h-4 text-[#FB923C]" />}
                >
                  {locale === "en" ? "Report Found Item" : "Laporkan Temuan"}
                </Button>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{locale === "en" ? "Anti-Scam Verified" : "Verifikasi Anti-Scam"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>{locale === "en" ? "Concealed Clues" : "Ciri Rahasia Terjaga"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 col-span-2 sm:col-span-1">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <span>{locale === "en" ? "Campus & Transit Nodes" : "Pos Lokasi Terdaftar"}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Prototype Preview */}
            <div className="lg:col-span-5">
              <Card padding="lg" className="border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {locale === "en" ? "Live Feed Prototype" : "Pratinjau Aktivitas Komunitas"}
                    </span>
                  </div>
                  <Badge variant="lost">Lost &amp; Found</Badge>
                </div>

                {/* Skeletons displaying honest layout expectation */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {locale === "en" ? "Dompet Lipat Hitam" : "Dompet Kulit Hitam"}
                      </span>
                      <Badge variant="lost" size="sm">Hilang</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {locale === "en"
                        ? "Reported near Central Library. Verification quiz required for claims."
                        : "Tercecer di sekitar Perpustakaan Pusat. Kuis verifikasi kepemilikan aktif."}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>{locale === "en" ? "1 private clue protected" : "1 ciri rahasia terlindungi"}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {locale === "en" ? "Kunci Motor Honda" : "Kunci Motor Vario"}
                      </span>
                      <Badge variant="found" size="sm">Ditemukan</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {locale === "en"
                        ? "Safely stored at Security Post Gate 1."
                        : "Diamankan di Pos Sekuriti Pintu Gerbang Utama."}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{locale === "en" ? "Location officer verified" : "Petugas pos terverifikasi"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FB923C] hover:text-[#EA580C] transition-colors"
                  >
                    <span>{locale === "en" ? "Explore full network" : "Buka beranda aplikasi"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* THREE FOUNDATION PILLARS */}
        <section className="px-4 sm:px-6 py-16 bg-white dark:bg-[#18181B] border-y border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-[1320px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                {locale === "en"
                  ? "Engineered for community trust"
                  : "Dirancang untuk integritas & rasa aman"}
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {locale === "en"
                  ? "Traditional social media feeds expose sensitive details that invite scammers. MuaraKu solves this with private verification."
                  : "Grup chat dan medsos biasa mengekspos foto dan detail lengkap yang memancing penipuan. MuaraKu memulihkan rasa percaya melalui protokol verifikasi rahasia."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card padding="lg" className="space-y-3 bg-[#F8F9FA] dark:bg-[#121214]">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {locale === "en" ? "Concealed Secret Clues" : "Ciri Rahasia Tersembunyi"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {locale === "en"
                    ? "Finders conceal 1–2 distinctive features. Scammers cannot guess what they cannot see."
                    : "Penemu menyembunyikan detail pembeda (warna kartu, isi saku rahasia). Penipu tidak dapat mengklaim barang yang ciri khasnya tidak dipublikasikan."}
                </p>
              </Card>

              <Card padding="lg" className="space-y-3 bg-[#F8F9FA] dark:bg-[#121214]">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {locale === "en" ? "Zero Ransom Guarantee" : "Bebas Pungutan & Tebusan"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {locale === "en"
                    ? "Platform policy strictly forbids extortion or ransom demands. Violators are banned permanently."
                    : "Kebijakan platform melarang keras segala bentuk permintaan uang tebusan atau transfer biaya. Pelanggar langsung diblokir permanen."}
                </p>
              </Card>

              <Card padding="lg" className="space-y-3 bg-[#F8F9FA] dark:bg-[#121214]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {locale === "en" ? "Verified Custody Desks" : "Titik Serah Terima Terverifikasi"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {locale === "en"
                    ? "Handover can be routed through verified security posts, campus desks, or registered transit offices."
                    : "Pengembalian barang dapat dititipkan melalui pos sekuriti, halte, atau loket kampus terverifikasi agar aman bagi kedua pihak."}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* COMMUNITY SKELETON / FEED PATTERN PREVIEW */}
        <section className="px-4 sm:px-6 py-16 max-w-[1320px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                {locale === "en" ? "Community Activity Pattern" : "Pola Aliran Laporan Komunitas"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {locale === "en"
                  ? "Standard loading & empty states ready for core report integration."
                  : "Pola skeleton responsif siap menerima data laporan riil di Sesi 3."}
              </p>
            </div>
            <Link href="/app">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {locale === "en" ? "Go to Main App" : "Menuju Beranda"}
              </Button>
            </Link>
          </div>

          {/* Clean Skeleton Feed Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonFeed count={3} />
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="px-4 sm:px-6 py-16 bg-white dark:bg-[#18181B] border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                {locale === "en" ? "Frequently Asked Questions" : "Pertanyaan yang Sering Diajukan"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {locale === "en"
                  ? "Clear policies on trust, verification, and privacy."
                  : "Transparansi seputar keamanan, privasi data, dan tata kelola MuaraKu."}
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F8F9FA] dark:bg-[#121214] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 min-h-[44px] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM ACTION BANNER */}
        <section className="px-4 sm:px-6 py-16 max-w-[1320px] mx-auto">
          <div className="rounded-3xl bg-zinc-950 dark:bg-[#18181B] text-white p-8 sm:p-14 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {locale === "en"
                  ? "Ready to find or return an item?"
                  : "Mulai bantu temukan kembali yang hilang"}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {locale === "en"
                  ? "Join the verified community network. Together, we make public spaces and campuses safer."
                  : "Bergabung bersama ribuan mahasiswa dan warga kampus yang saling peduli dan menjaga integritas lingkungan."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => openAuthModal("register")}
              >
                {locale === "en" ? "Register Now" : "Daftar Sekarang"}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
