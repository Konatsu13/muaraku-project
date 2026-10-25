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
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";

export default function FinderPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"explore" | "my_reports">("explore");
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [reports, setReports] = useState<ReportDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);

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

    const isMyReports = activeTab === "my_reports";

    if (isMyReports && !user?.id) {
      if (isCancelledRef?.current) return;
      setReports([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    const res = await fetchReports({
      type: "found",
      reporter_user_id: isMyReports ? user?.id : undefined,
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
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
  }, [activeTab, user?.id, selectedCategory, page]);

  // Load found reports
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

  const handleSavedChange = (reportId: string, isSaved: boolean) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, is_saved: isSaved } : r))
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-1.5">
            <Package className="w-3 h-3" />
            <span>Finder Hub • Barang Ditemukan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Laporan Temuan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Bantu kembalikan barang kepada pemilik sahnya dengan proses klaim transparan
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Laporan Temuan</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/80 dark:bg-[#121214] p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("explore");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "explore"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Semua Temuan
          </button>
          <button
            onClick={() => {
              setActiveTab("my_reports");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "my_reports"
                ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-emerald-600"
            }`}
          >
            Temuan Saya
          </button>
        </div>

        <div className="flex items-center gap-2.5">
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

          <button
            onClick={() => loadData()}
            title="Muat ulang data"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Count Info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Menampilkan {reports.length} dari {totalCount} barang temuan
        </span>
        {totalPages > 1 && (
          <span>
            Halaman {page} dari {totalPages}
          </span>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingPattern />
      ) : errorMsg ? (
        <ErrorPattern message={errorMsg} onRetry={loadData} />
      ) : activeTab === "my_reports" && !user ? (
        <EmptyPattern
          title="Masuk untuk melihat laporan temuan Anda"
          description="Anda perlu masuk ke akun MuaraKu terlebih dahulu untuk mengelola laporan barang temuan yang telah Anda kirimkan."
        />
      ) : reports.length === 0 ? (
        <EmptyPattern
          title={activeTab === "my_reports" ? "Belum ada laporan temuan Anda" : "Belum ada barang temuan"}
          description={
            activeTab === "my_reports"
              ? "Anda belum menerbitkan laporan barang temuan. Bantu sesama warga dengan melaporkan barang yang Anda temukan."
              : "Saat ini tidak ada laporan barang temuan yang cocok dengan filter."
          }
          actionLabel="Buat Laporan Temuan"
          onAction={() => setReportModalOpen(true)}
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

      {/* Pagination */}
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

      {/* Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType="found"
        onSuccess={() => {
          loadData();
          setActiveTab("my_reports");
        }}
      />
    </div>
  );
}
