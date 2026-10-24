"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Bookmark,
  CheckCircle2,
  Package,
  Search,
} from "lucide-react";
import { ReportDetailItem, toggleSaveReport } from "@/lib/supabase/reports";

export type ReportItem = ReportDetailItem;

interface ReportCardProps {
  report: ReportDetailItem;
  onSavedChange?: (reportId: string, isSaved: boolean) => void;
}

export const ReportCard = React.memo(function ReportCard({ report, onSavedChange }: ReportCardProps) {
  const isLost = report.report_type === "lost";
  const [isSaved, setIsSaved] = useState(report.is_saved ?? false);
  const [saving, setSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    // Optimistic toggle
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    const res = await toggleSaveReport(report.id);
    if (res.error) {
      // Revert if error
      setIsSaved(!nextSaved);
    } else {
      setIsSaved(res.isSaved);
      if (onSavedChange) onSavedChange(report.id, res.isSaved);
    }
    setSaving(false);
  };

  const formattedDate = (() => {
    const d = report.occurred_at || report.created_at;
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  })();

  const statusLabel = (() => {
    switch (report.case_status) {
      case "returned":
        return { text: "Telah Dikembalikan", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      case "claim_in_progress":
        return { text: "Proses Klaim", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      case "closed":
        return { text: "Ditutup", className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" };
      default:
        return null;
    }
  })();

  return (
    <div className="group bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/90 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between">
      <div>
        {/* Media Thumbnail */}
        <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80 overflow-hidden">
          {report.primary_image_url ? (
            <img
              src={report.primary_image_url}
              alt={report.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 p-4">
              {isLost ? (
                <Search className="w-8 h-8 stroke-[1.5] mb-1.5 opacity-60" />
              ) : (
                <Package className="w-8 h-8 stroke-[1.5] mb-1.5 opacity-60" />
              )}
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Foto tidak dilampirkan
              </span>
            </div>
          )}

          {/* Badges on Top */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${
                  isLost
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60"
                }`}
              >
                {isLost ? "Kehilangan" : "Ditemukan"}
              </span>

              {report.category_name && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800">
                  {report.category_name}
                </span>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleToggleSave}
              disabled={saving}
              aria-label={isSaved ? "Hapus dari simpanan" : "Simpan laporan"}
              className={`pointer-events-auto min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800 transition-colors ${
                isSaved
                  ? "text-orange-500 fill-orange-500"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-orange-500" : ""}`} />
            </button>
          </div>

          {/* Moderation Pending Review Notice for Owner */}
          {report.moderation_status === "pending_review" && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-amber-500/90 dark:bg-amber-600/90 text-zinc-950 text-[10px] font-semibold rounded-md text-center">
              Menunggu peninjauan moderator
            </div>
          )}

          {/* Returned Overlay */}
          {report.case_status === "returned" && (
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Telah Dikembalikan
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5">
          <Link
            href={`/app/reports/${report.id}`}
            className="block group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 rounded"
          >
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1">
              {report.title}
            </h3>
          </Link>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {report.description}
          </p>

          <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400 pb-3 border-b border-zinc-100 dark:border-zinc-800/70">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">
                {report.location_label || report.city || "Indonesia"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Author & Action Link */}
      <div className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden flex-shrink-0">
            {report.author_avatar ? (
              <img src={report.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (report.author_name || "W")[0].toUpperCase()
            )}
          </div>
          <span className="truncate text-zinc-700 dark:text-zinc-300 font-medium">
            {report.author_name}
          </span>
        </div>

        {statusLabel ? (
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${statusLabel.className}`}>
            {statusLabel.text}
          </span>
        ) : (
          <Link
            href={`/app/reports/${report.id}`}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Lihat detail →
          </Link>
        )}
      </div>
    </div>
  );
});
