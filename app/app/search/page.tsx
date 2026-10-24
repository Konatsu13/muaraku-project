"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import {
  fetchReports,
  fetchCategories,
  ReportDetailItem,
  ReportCategory,
} from "@/lib/supabase/reports";
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");

  const [locationLabel, setLocationLabel] = useState("");
  const [debouncedLocationLabel, setDebouncedLocationLabel] = useState("");

  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<ReportDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  // Debounce text search inputs with ~300ms cooldown to avoid spamming queries on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setDebouncedCity(city.trim());
      setDebouncedLocationLabel(locationLabel.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, city, locationLabel]);

  const executeSearch = useCallback(async (isCancelledRef?: { current: boolean }) => {
    if (isCancelledRef?.current) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await fetchReports({
      type: filterType,
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      city: debouncedCity || undefined,
      location_label: debouncedLocationLabel || undefined,
      search_query: debouncedQuery || undefined,
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
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
  }, [filterType, selectedCategory, debouncedCity, debouncedLocationLabel, debouncedQuery, startDate, endDate, page]);

  // Load reports
  useEffect(() => {
    const isCancelledRef = { current: false };
    executeSearch(isCancelledRef);
    return () => {
      isCancelledRef.current = true;
    };
  }, [executeSearch]);

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setFilterType("all");
    setSelectedCategory("all");
    setCity("");
    setDebouncedCity("");
    setLocationLabel("");
    setDebouncedLocationLabel("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    query ||
    filterType !== "all" ||
    selectedCategory !== "all" ||
    city ||
    locationLabel ||
    startDate ||
    endDate;

  const handleSavedChange = (reportId: string, isSaved: boolean) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, is_saved: isSaved } : r))
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pencarian &amp; Filter Laporan
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Cari barang hilang dan temuan berdasarkan kata kunci, lokasi, kategori, dan rentang tanggal
        </p>
      </div>

      {/* Main Search Bar & Multi-filter Box */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Full-text query bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul, ciri warna, merek, atau deskripsi barang..."
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Granular Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Type */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Tipe Laporan
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as "all" | "lost" | "found");
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="lost">Kehilangan (Lost)</option>
              <option value="found">Temuan (Found)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_id}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Kota
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="Contoh: Jakarta"
              className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Location label */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Lokasi Teks
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => {
                setLocationLabel(e.target.value);
                setPage(1);
              }}
              placeholder="Contoh: Bandara Soetta"
              className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Date Range & Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Rentang:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px]"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px]"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Ditemukan {totalCount} hasil pencarian
        </span>
        {totalPages > 1 && (
          <span>
            Halaman {page} dari {totalPages}
          </span>
        )}
      </div>

      {/* Main Results */}
      {loading ? (
        <LoadingPattern />
      ) : errorMsg ? (
        <ErrorPattern message={errorMsg} onRetry={executeSearch} />
      ) : reports.length === 0 ? (
        <EmptyPattern
          title="Tidak ada laporan yang sesuai"
          description="Coba ubah kata kunci pencarian, sesuaikan filter lokasi, atau reset filter untuk melihat lebih banyak laporan."
          actionLabel="Reset Filter"
          onAction={clearFilters}
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
    </div>
  );
}
