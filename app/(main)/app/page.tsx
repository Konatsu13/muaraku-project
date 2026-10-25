"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import {
  fetchReports,
  fetchCategories,
  ReportDetailItem,
  ReportCategory,
} from "@/lib/supabase/reports";
import { useAuth } from "@/lib/auth";
import {
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";

export default function DiscoverPage() {
  const { user } = useAuth();

  const [feedType, setFeedType] = useState<"all" | "lost" | "found">("all");
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "title" | "occurred_at">("latest");
  const [page, setPage] = useState(1);

  const [reports, setReports] = useState<ReportDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<"lost" | "found">("lost");

  // Load categories once
  useEffect(() => {
    fetchCategories().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  const loadData = useCallback(async (isCancelledRef?: { current: boolean }) => {
    if (isCancelledRef?.current) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await fetchReports({
      type: feedType,
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      sort_by: sortBy,
      page,
      pageSize: 12,
    });

    if (isCancelledRef?.current) return;

    if (res.error) {
      setErrorMsg(res.error.message);
      setReports([]);
      setTotalCount(0);
      setTotalPages(1);
    } else {
      setReports(res.data);
      setTotalCount(res.count);
      setTotalPages(res.totalPages || 1);
    }
    if (isCancelledRef?.current) return;
    setLoading(false);
  }, [feedType, selectedCategory, sortBy, page]);

  // Load feed reports
  useEffect(() => {
    const isCancelledRef = { current: false };
    // Defer one tick: the loader resets loading/error state synchronously,
    // which must not run during the effect body.
    const timer = setTimeout(() => {
      if (!isCancelledRef.current) loadData(isCancelledRef);
    }, 0);
    return () => {
      isCancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [loadData]);

  const handleOpenCreateModal = (type: "lost" | "found") => {
    setModalDefaultType(type);
    setReportModalOpen(true);
  };

  const handleSavedChange = (reportId: string, isSaved: boolean) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, is_saved: isSaved } : r))
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Header Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Discover Feed
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Jejaring laporan barang tertinggal dan temuan terverifikasi warga
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreateModal("lost")}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lapor Kehilangan</span>
          </button>
          <button
            onClick={() => handleOpenCreateModal("found")}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lapor Temuan</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/80 dark:bg-[#121214] p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setFeedType("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              feedType === "all"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => {
              setFeedType("lost");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              feedType === "lost"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-rose-600"
            }`}
          >
            Kehilangan
          </button>
          <button
            onClick={() => {
              setFeedType("found");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              feedType === "found"
                ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-emerald-600"
            }`}
          >
            Ditemukan
          </button>
        </div>

        {/* Secondary filters: Category & Sort */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "title" | "occurred_at")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="latest">Terbaru Terbit</option>
              <option value="occurred_at">Waktu Kejadian</option>
              <option value="title">Abjad Nama</option>
            </select>
          </div>

          <button
            onClick={() => loadData()}
            title="Muat ulang data"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Status Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Menampilkan {reports.length} dari {totalCount} laporan
        </span>
        {totalPages > 1 && (
          <span>
            Halaman {page} dari {totalPages}
          </span>
        )}
      </div>

      {/* 4. Content Area */}
      {loading ? (
        <LoadingPattern />
      ) : errorMsg ? (
        <ErrorPattern message={errorMsg} onRetry={loadData} />
      ) : reports.length === 0 ? (
        <EmptyPattern
          title="Belum ada laporan aktif"
          description={
            feedType === "lost"
              ? "Tidak ada laporan barang hilang yang cocok dengan filter saat ini."
              : feedType === "found"
              ? "Tidak ada laporan barang temuan yang cocok dengan filter saat ini."
              : "Belum ada laporan yang terdaftar atau telah disetujui moderator."
          }
          actionLabel="Buat Laporan Baru"
          onAction={() => handleOpenCreateModal("lost")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSavedChange={handleSavedChange}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination Navigation */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-8 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs text-zinc-500 px-3">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1"
          >
            <span>Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6. Report Creation / Edit Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType={modalDefaultType}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
