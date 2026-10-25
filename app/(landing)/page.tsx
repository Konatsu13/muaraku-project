"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicReportFeed } from "@/components/public/PublicReportFeed";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Search,
  PlusCircle,
  Lock,
  MapPin,
  ShieldCheck,
  ChevronDown,
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

  const assurances = [
    {
      icon: Lock,
      title:
        locale === "en"
          ? "Concealed secret clues"
          : "Ciri rahasia tersembunyi",
      body:
        locale === "en"
          ? "Finders conceal 1–2 distinctive features. Scammers cannot claim what they cannot see."
          : "Penemu menyembunyikan 1–2 detail pembeda. Penipu tidak dapat mengklaim barang yang ciri khasnya tidak dipublikasikan.",
    },
    {
      icon: ShieldCheck,
      title:
        locale === "en"
          ? "Zero ransom guarantee"
          : "Bebas pungutan dan tebusan",
      body:
        locale === "en"
          ? "Platform policy strictly forbids extortion or ransom demands. Violators are banned permanently."
          : "Kebijakan platform melarang keras segala bentuk pungutan atau tebusan. Pelanggar diblokir permanen.",
    },
    {
      icon: MapPin,
      title:
        locale === "en"
          ? "Verified custody desks"
          : "Titik serah terima terverifikasi",
      body:
        locale === "en"
          ? "Handover can be routed through verified security posts, campus desks, or registered transit offices."
          : "Serah terima dapat dititipkan lewat pos sekuriti, loket kampus, atau halte terdaftar yang terverifikasi.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas dark:bg-[#18181B] text-main-text transition-colors">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-20 max-w-[1320px] mx-auto">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-secondary-text">
              Lost &amp; Found Komunitas
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
              {locale === "en"
                ? "A meeting point for what was separated."
                : "Titik temu bagi yang terpisah."}
            </h1>

            <p className="text-base sm:text-lg text-secondary-text leading-relaxed max-w-xl">
              {locale === "en"
                ? "A community platform for reporting, searching, and verifying lost items across campuses and public spaces — free from ransoms and scams."
                : "Platform komunitas untuk melaporkan, mencari, dan memverifikasi barang hilang di kampus dan ruang publik — bebas pungutan dan penipuan."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/app">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  {locale === "en" ? "Search lost items" : "Cari Barang Hilang"}
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuthModal("login")}
                leftIcon={<PlusCircle className="w-4 h-4 text-trust" />}
              >
                {locale === "en" ? "Report a found item" : "Laporkan Temuan"}
              </Button>
            </div>

            <ul className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 list-none">
              <li className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Verifikasi Anti-Scam</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Ciri Rahasia Terjaga</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Pos Lokasi Terdaftar</span>
              </li>
            </ul>
          </div>
        </section>

        {/* COMMUNITY FEED — approved reports from the database */}
        <section
          id="community-reports"
          className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-[1320px] mx-auto"
        >
          <div className="max-w-xl space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {locale === "en"
                ? "Recent lost and found reports"
                : "Laporan barang terbaru"}
            </h2>
            <p className="text-sm text-secondary-text leading-relaxed">
              {locale === "en"
                ? "Browse real community reports approved for public viewing."
                : "Lihat laporan warga yang telah disetujui untuk ditampilkan secara publik."}
            </p>
          </div>
          <PublicReportFeed />
        </section>

        {/* ASSURANCES */}
        <section className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-[1320px] mx-auto">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {locale === "en"
                ? "Built for honesty and safety"
                : "Dirancang untuk integritas & rasa aman"}
            </h2>
            <p className="text-sm text-secondary-text leading-relaxed">
              {locale === "en"
                ? "Social media and group chats leak details that invite scams. MuaraKu closes that gap with private verification."
                : "Media sosial dan grup chat membocorkan detail yang memancing penipuan. MuaraKu menutup celah itu lewat verifikasi privat."}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {assurances.map((item) => (
              <div key={item.title}>
                <item.icon className="w-5 h-5 mb-3 text-secondary-text" aria-hidden />
                <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 sm:px-6 pb-16 max-w-[720px] mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {locale === "en"
              ? "Frequently asked questions"
              : "Pertanyaan yang Sering Diajukan"}
          </h2>
          <p className="text-sm text-secondary-text mb-8">
            {locale === "en"
              ? "Clear openness on safety, privacy, and how MuaraKu is governed."
              : "Transparansi seputar keamanan, privasi, dan tata kelola MuaraKu."}
          </p>

          <div className="space-y-1">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-lg">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-3 py-3.5 text-left text-sm sm:text-base font-medium rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 text-secondary-text transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-3 pb-4 pr-8 text-sm text-secondary-text leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA — centered */}
        <section className="px-4 sm:px-6 pb-20 max-w-[1320px] mx-auto">
          <div className="rounded-2xl bg-surface px-6 sm:px-10 py-12 flex flex-col items-center text-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight max-w-xl">
              {locale === "en"
                ? "Ready to find or return an item?"
                : "Siap menemukan atau mengembalikan barang?"}
            </h2>
            <p className="text-sm text-secondary-text leading-relaxed max-w-md">
              {locale === "en"
                ? "Join the verified campus and public-space community across Indonesia."
                : "Bergabung dengan komunitas terverifikasi kampus dan ruang publik Indonesia."}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-1"
              onClick={() => openAuthModal("register")}
            >
              {locale === "en" ? "Register now" : "Daftar Sekarang"}
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
