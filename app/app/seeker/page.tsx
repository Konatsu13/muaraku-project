"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { fetchReports } from "@/lib/supabase/reports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Search,
  Sparkles,
  Plus,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";

export default function SeekerPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<"explore" | "my_reports" | "matches">("explore");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [lostReports, setLostReports] = useState<ReportItem[]>([]);
  const [myReports, setMyReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMsg(null);

    const [allLostRes, myLostRes] = await Promise.all([
      fetchReports({ type: "lost" }),
      user ? fetchReports({ type: "lost", reporter_user_id: user.id }) : Promise.resolve({ data: [], error: null }),
    ]);

    if (allLostRes.error) {
      setErrorMsg(allLostRes.error.message);
    } else {
      setLostReports(allLostRes.data);
    }

    if (myLostRes.data) {
      setMyReports(myLostRes.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadData();
    })();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const matchedReports = lostReports.filter((r) => Boolean(r.match_confidence));

  const handleReportCreated = () => {
    loadData();
    setActiveTab("my_reports");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Search className="w-3.5 h-3.5" />
            <span>Seeker Hub • Fokus Barang Hilang</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.seeker.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.seeker.subtitle}
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-transform transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.seeker.create_cta}</span>
        </button>
      </div>

      {/* Tabs Subnavigation */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 self-start overflow-x-auto">
        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "explore"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.seeker.tab_explore} ({lostReports.length})
        </button>
        <button
          onClick={() => setActiveTab("my_reports")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "my_reports"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.seeker.tab_my_reports} ({myReports.length})
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "matches"
              ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>{t.seeker.tab_matches} ({matchedReports.length})</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-xs text-zinc-500">Memuat laporan kehilangan...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-10 text-center rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {/* Content per Tab */}
          {activeTab === "explore" && (
            lostReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                <Search className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  Belum Ada Laporan Kehilangan
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Belum ada laporan kehilangan yang aktif. Jika Anda kehilangan barang, buat laporan sekarang.
                </p>
                <div>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs"
                  >
                    {t.seeker.create_cta}
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === "my_reports" && (
            <div className="space-y-6">
              {myReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myReports.map((report) => (
                    <div key={report.id} className="relative">
                      <ReportCard report={report} />
                      <div className="mt-2 flex items-center justify-between text-xs px-2 text-zinc-500">
                        <span className="font-semibold text-emerald-600">Status: Aktif Memantau</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                  <FileText className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    {t.seeker.no_my_reports}
                  </h3>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs"
                  >
                    {t.seeker.create_cta}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Kandidat Rekomendasi AI Matching:</strong> Algoritma menganalisis kesamaan atribut lokasi, waktu, dan ciri visual laporan Anda terhadap laporan temuan di database.
                </div>
              </div>

              {matchedReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                  Belum ada kandidat kecocokan otomatis saat ini.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType="lost"
        onReportCreated={handleReportCreated}
      />
    </div>
  );
}
