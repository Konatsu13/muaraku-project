"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { fetchReports } from "@/lib/supabase/reports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Package,
  Plus,
  FileCheck,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";

export default function FinderPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<"explore" | "my_reports" | "claims">("explore");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [foundReports, setFoundReports] = useState<ReportItem[]>([]);
  const [myFoundReports, setMyFoundReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMsg(null);

    const [allFoundRes, myFoundRes] = await Promise.all([
      fetchReports({ type: "found" }),
      user ? fetchReports({ type: "found", reporter_user_id: user.id }) : Promise.resolve({ data: [], error: null }),
    ]);

    if (allFoundRes.error) {
      setErrorMsg(allFoundRes.error.message);
    } else {
      setFoundReports(allFoundRes.data);
    }

    if (myFoundRes.data) {
      setMyFoundReports(myFoundRes.data);
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

  const handleReportCreated = () => {
    loadData();
    setActiveTab("my_reports");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Package className="w-3.5 h-3.5" />
            <span>Finder Hub • Fokus Barang Temuan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.finder.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.finder.subtitle}
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-transform transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.finder.create_cta}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 self-start overflow-x-auto">
        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "explore"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.finder.tab_explore} ({foundReports.length})
        </button>
        <button
          onClick={() => setActiveTab("my_reports")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "my_reports"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.finder.tab_my_reports} ({myFoundReports.length})
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "claims"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.finder.tab_claims} (0)</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-zinc-500">Memuat laporan barang temuan...</p>
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
          {/* Content */}
          {activeTab === "explore" && (
            foundReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  Belum Ada Laporan Barang Temuan
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Belum ada laporan temuan aktif di feed saat ini. Jika Anda menemukan barang, laporkan di sini agar pemilik dapat menghubungi Anda.
                </p>
                <div>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    {t.finder.create_cta}
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === "my_reports" && (
            <div className="space-y-6">
              {myFoundReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myFoundReports.map((report) => (
                    <div key={report.id}>
                      <ReportCard report={report} />
                      <div className="mt-2 flex items-center justify-between text-xs px-2 text-zinc-500">
                        <span className="font-semibold text-emerald-600">Menunggu Klaim Pemilik</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                  <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    Belum Ada Laporan Temuan Saya
                  </h3>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    {t.finder.create_cta}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Manajemen Verifikasi Klaim:</strong> Pengklaim barang wajib memberikan bukti verifikasi kepemilikan privat sebelum serah terima dilakukan.
                </div>
              </div>

              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                <Inbox className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  Tidak Ada Klaim Masuk
                </h3>
                <p className="text-xs text-zinc-500">
                  Saat ada pengguna yang mengklaim barang temuan Anda, rincian verifikasi rahasia akan muncul di sini.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType="found"
        onReportCreated={handleReportCreated}
      />
    </div>
  );
}
