"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { fetchReports } from "@/lib/supabase/reports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  ShieldCheck,
  Lock,
  ArrowUpDown,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";

export default function DiscoverPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t, locale } = useI18n();

  const [feedFilter, setFeedFilter] = useState<"all" | "lost" | "found">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "name">("latest");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const categories = [
    { id: "all", label: "Semua Kategori" },
    { id: "elektronik", label: "Elektronik" },
    { id: "dompet", label: "Dompet & Kartu" },
    { id: "tas", label: "Tas & Ransel" },
    { id: "kunci", label: "Kunci & Aksesori" },
    { id: "identitas", label: "Identitas" },
    { id: "perlengkapan", label: "Perlengkapan" },
  ];

  const loadData = useCallback(async () => {
    setErrorMsg(null);
    const res = await fetchReports({
      type: feedFilter,
    });

    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      setReports(res.data);
    }
    setLoading(false);
  }, [feedFilter]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadData();
    })();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const filteredReports = reports.filter((report) => {
    if (selectedCategory !== "all") {
      const matchCat = report.category
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }
    return true;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    return 0; // Default: latest (already ordered by created_at desc)
  });

  const handleChatClick = (report: ReportItem) => {
    router.push(`/app/messages?reportId=${report.id}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. HERO BANNER: Civic Welcome & Genuine Trust Highlights */}
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

          {/* Trust Highlights Capsules (Civic Principles, no fake metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[300px] sm:min-w-[340px]">
            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Anti-Fraud
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                Bukti Privat
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Ciri rahasia aman dienkripsi
              </span>
            </div>

            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Pos Mitra
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                Petugas Lokasi
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Lencana kuning terverifikasi
              </span>
            </div>

            <div className="bg-[#FFFCF8] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-2xl flex flex-col">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Dua Alur
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                Seeker &amp; Finder
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Kelola laporan terpisah
              </span>
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
              onClick={() => setSortBy(sortBy === "latest" ? "name" : "latest")}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>{sortBy === "latest" ? "Terbaru" : "Nama"}</span>
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

      {/* 3. REPORT CARDS GRID / EMPTY STATE / ERROR STATE */}
      <section>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-xs text-zinc-500">Memuat laporan dari database...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-10 text-center rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Gagal Memuat Laporan
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : sortedReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onChatClick={handleChatClick}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {t.discover.no_reports}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {selectedCategory !== "all"
                  ? "Tidak ada laporan pada kategori ini. Coba pilih 'Semua Kategori'."
                  : "Belum ada laporan aktif di feed. Jadilah yang pertama membuat laporan untuk saling membantu!"}
              </p>
            </div>
            <div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Laporan Baru</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          loadData();
        }}
        defaultType="lost"
      />
    </div>
  );
}
