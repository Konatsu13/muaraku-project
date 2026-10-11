"use client";

import React, { useState } from "react";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { initialSampleReports } from "@/lib/data/sampleReports";
import { useI18n } from "@/lib/i18n";
import {
  Search,
  Sparkles,
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";

export default function SearchPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const sampleKeywords = [
    t.search.chip_1,
    t.search.chip_2,
    t.search.chip_3,
    t.search.chip_4,
  ];

  const searchResults = initialSampleReports.filter((report) => {
    // Type filter
    if (filterType === "lost" && report.type !== "lost") return false;
    if (filterType === "found" && report.type !== "found") return false;

    // Category filter
    if (filterCategory !== "all") {
      if (!report.category.toLowerCase().includes(filterCategory.toLowerCase()))
        return false;
    }

    // Verified staff only
    if (filterVerifiedOnly && !report.is_verified_staff) return false;

    // Query filter
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = report.title.toLowerCase().includes(q);
      const matchDesc = report.description.toLowerCase().includes(q);
      const matchLoc = report.location_name.toLowerCase().includes(q);
      const matchCat = report.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchCat;
    }

    return true;
  });

  const clearFilters = () => {
    setQuery("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterVerifiedOnly(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Search Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Natural Language Search (N2L Engine)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.search.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {t.search.subtitle}
          </p>
        </div>

        {/* Big Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-400 font-medium">Contoh:</span>
          {sampleKeywords.map((kw, i) => (
            <button
              key={i}
              onClick={() => setQuery(kw)}
              className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
            >
              &quot;{kw}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Type selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Jenis:</span>
          <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType("lost")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === "lost"
                  ? "bg-white dark:bg-zinc-900 text-rose-600 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Kehilangan
            </button>
            <button
              onClick={() => setFilterType("found")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === "found"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Ditemukan
            </button>
          </div>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="elektronik">Elektronik</option>
            <option value="dompet">Dompet &amp; Kartu</option>
            <option value="tas">Tas &amp; Ransel</option>
            <option value="kunci">Kunci &amp; Aksesori</option>
            <option value="identitas">Identitas</option>
            <option value="perlengkapan">Perlengkapan</option>
          </select>
        </div>

        {/* Verified Staff checkbox */}
        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-zinc-300 dark:border-zinc-600"
          />
          <span>Hanya Pos Petugas Terverifikasi</span>
        </label>

        {/* Reset filter button */}
        {(query || filterType !== "all" || filterCategory !== "all" || filterVerifiedOnly) && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {searchResults.length} {t.search.results_found}
        </p>
      </div>

      {/* Results Grid */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t.search.no_results}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {t.search.broaden_search}
          </p>
        </div>
      )}
    </div>
  );
}
