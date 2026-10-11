"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface ReportItem {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  location_name: string;
  incident_date: string;
  status: "active" | "claimed" | "returned" | "closed";
  image_url?: string | null;
  author_name: string;
  author_avatar?: string | null;
  is_verified_staff?: boolean;
  match_confidence?: number;
}

interface ReportCardProps {
  report: ReportItem;
  onChatClick?: (report: ReportItem) => void;
}

export function ReportCard({ report, onChatClick }: ReportCardProps) {
  const isLost = report.type === "lost";

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      {/* Photo Area (16:10 aspect ratio) */}
      <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 p-4">
            <span className="text-4xl mb-2">{isLost ? "🔍" : "📦"}</span>
            <span className="text-xs font-medium">Foto barang privat / tidak diunggah</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Type Badge */}
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md ${
              isLost
                ? "bg-rose-500/90 text-white"
                : "bg-emerald-600/90 text-white"
            }`}
          >
            {isLost ? "Kehilangan" : "Ditemukan"}
          </span>

          {/* Category Chip */}
          <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 shadow-sm border border-black/5">
            {report.category}
          </span>
        </div>

        {/* AI Match Badge (if provided) */}
        {report.match_confidence && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/95 text-white text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kecocokan AI {Math.round(report.match_confidence * 100)}%</span>
          </div>
        )}

        {/* Status Returned Badge */}
        {report.status === "returned" && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Telah Dikembalikan
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/app/reports/${report.id}`} className="block group-hover:text-orange-500 transition-colors">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1 mb-1.5">
              {report.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {report.description}
          </p>

          {/* Location & Time Stamp */}
          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{report.location_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>{report.incident_date}</span>
            </div>
          </div>
        </div>

        {/* Author row & Action buttons */}
        <div>
          <div className="flex items-center justify-between mb-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                {report.author_avatar ? (
                  <img src={report.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  report.author_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {report.author_name}
                </span>

                {/* Yellow Verified Staff Badge */}
                {report.is_verified_staff && (
                  <span
                    title="Petugas lokasi terverifikasi"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  >
                    <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Petugas</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChatClick && onChatClick(report)}
              className="flex-1 py-2 px-3 rounded-xl border border-emerald-600 dark:border-emerald-500/80 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <Link
              href={`/app/reports/${report.id}`}
              className="py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
