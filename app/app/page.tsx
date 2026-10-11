"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { initialSampleReports } from "@/lib/data/sampleReports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  TrendingUp,
  CheckCircle,
  ArrowUpDown,
  Search,
} from "lucide-react";

export default function DiscoverPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const [feedFilter, setFeedFilter] = useState<"all" | "lost" | "found">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "matched">("latest");

  const categories = [
    { id: "all", label: "Semua Kategori" },
    { id: "elektronik", label: "Elektronik" },
    { id: "dompet", label: "Dompet & Kartu" },
    { id: "tas", label: "Tas & Ransel" },
    { id: "kunci", label: "Kunci & Aksesori" },
    { id: "identitas", label: "Identitas" },
    { id: "perlengkapan", label: "Perlengkapan" },
  ];

  const filteredReports = initialSampleReports.filter((report) => {
    if (feedFilter === "lost" && report.type !== "lost") return false;
    if (feedFilter === "found" && report.type !== "found") return false;

    if (selectedCategory !== "all") {
      const matchCat = report.category
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }

    return true;
  });

  const handleChatClick = (report: ReportItem) => {
    router.push(`/app/messages?reportId=${report.id}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. HERO BANNER: Civic Welcome & Status Metrics */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Jejaring Temu Kembali Terpercaya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Halo, {profile?.display_name || user?.email?.split("@")[0] || "Warga MuaraKu"}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Jelajahi laporan barang tertinggal dan temuan di sekitar Anda. Semua klaim dilindungi nomor registrasi unik dan verifikasi privat anti-fraud.
            </p>
          </div>

          {/* Metric Capsules */}
          <div className="grid grid-cols-3 gap-3 min-w-[300px] sm:min-w-[340px]">
            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Laporan Aktif</span>
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-0.5">142</span>
              <span className="text-[10px] font-bold text-orange-500 mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +12 hari ini
              </span>
            </div>

            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Dikembalikan</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">89</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" /> 92% sukses
              </span>
            </div>

            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Mitra Petugas</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-0.5">18</span>
              <span className="text-[10px] font-bold text-zinc-400 mt-1">Pos resmi</span>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-orange-500/5 rounded-full pointer-events-none blur-3xl" />
      </section>

      {/* 2. FEED FILTER CONTROLS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Feed Type Pills */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 self-start">
            <button
              onClick={() => setFeedFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feedFilter === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Semua Laporan
            </button>
            <button
              onClick={() => setFeedFilter("lost")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feedFilter === "lost"
                  ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Barang Hilang
            </button>
            <button
              onClick={() => setFeedFilter("found")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feedFilter === "found"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Barang Ditemukan
            </button>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-zinc-400">Urutkan:</span>
            <button
              onClick={() => setSortBy(sortBy === "latest" ? "matched" : "latest")}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>{sortBy === "latest" ? "Terbaru" : "Kecocokan AI"}</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. REPORT CARDS GRID */}
      <section>
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onChatClick={handleChatClick}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              {t.discover.no_reports}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Coba sesuaikan filter kategori di atas atau gunakan Pencarian Cerdas (N2L).
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
