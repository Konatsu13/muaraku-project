"use client";

import React, { useState } from "react";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { initialSampleReports } from "@/lib/data/sampleReports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Package,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";

export default function FinderPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<"explore" | "my_reports" | "claims">("explore");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportsList, setReportsList] = useState<ReportItem[]>(initialSampleReports);

  // Found items filter
  const foundReports = reportsList.filter((r) => r.type === "found");

  // My found items
  const myFoundReports = foundReports.filter(
    (r) =>
      r.author_name === (profile?.display_name || user?.email?.split("@")[0]) ||
      r.id === "rep-001"
  );

  const sampleIncomingClaims = [
    {
      id: "clm-101",
      report_title: "Kunci Motor Honda Vario Gantungan Doraemon",
      claimant_name: "Budi Santoso",
      claimant_avatar: null,
      submitted_at: "35 menit lalu",
      status: "pending",
      statement:
        "Kunci cadangan ada lecet di bagian remote alarm hitam. Terdapat nomor seri timbul di sisi belakang kunci motor.",
      matched_method: "Bertemu di Pos Petugas Keamanan",
    },
  ];

  const handleReportCreated = (newReport: ReportItem) => {
    setReportsList((prev) => [newReport, ...prev]);
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
          <span>{t.finder.tab_claims} (1)</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "explore" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
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
                    <button
                      onClick={() => alert("Pengelolaan status barang siap digunakan.")}
                      className="text-orange-600 hover:underline font-semibold"
                    >
                      Tandai Dikembalikan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
              <Package className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {t.finder.no_my_reports}
              </h3>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                {t.finder.create_cta}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "claims" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Pengelolaan Klaim Masuk:</strong> Tinjau bukti rahasia yang disampaikan oleh pengklaim. Jika jawaban cocok dengan ciri asli barang yang Anda simpan, koordinasikan serah terima di pos petugas.
            </div>
          </div>

          {sampleIncomingClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {claim.report_title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>Pengklaim: <strong>{claim.claimant_name}</strong></span>
                    <span>•</span>
                    <span>{claim.submitted_at}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 self-start">
                  Perlu Ditinjau
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Pernyataan Ciri Rahasia Pengklaim:
                </span>
                <p className="italic">{claim.statement}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-500">
                  Metode Serah Terima: <strong>{claim.matched_method}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Klaim ditolak secara netral.")}
                    className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors"
                  >
                    Tolak Klaim
                  </button>
                  <button
                    onClick={() => alert("Klaim diverifikasi! Kontak aman telah dibuka.")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Verifikasi &amp; Lanjutkan Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
