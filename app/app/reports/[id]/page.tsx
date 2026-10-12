"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ReportItem } from "@/components/reports/ReportCard";
import { ClaimModal } from "@/components/reports/ClaimModal";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";
import { useI18n } from "@/lib/i18n";
import {
  MapPin,
  Clock,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Share2,
  Flag,
  Globe,
  Lock,
  Search,
  Package,
  Loader2,
} from "lucide-react";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const supabase = createClient();
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;

  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          report_type,
          title,
          description,
          location_label,
          city,
          occurred_at,
          case_status,
          created_at,
          user_profiles:reporter_user_id (
            display_name,
            avatar_path
          ),
          report_categories:category_id (
            name_id,
            name_en
          ),
          report_media (
            object_path
          )
        `)
        .eq("id", reportId)
        .maybeSingle();

      if (data && !error) {
        let itemStatus: "active" | "claimed" | "returned" | "closed" = "active";
        if (data.case_status === "claim_in_progress") itemStatus = "claimed";
        else if (data.case_status === "returned") itemStatus = "returned";
        else if (data.case_status === "closed") itemStatus = "closed";

        const dateObj = new Date(data.occurred_at || data.created_at);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        let imageUrl: string | null = null;
        if (data.report_media && data.report_media.length > 0) {
          const path = data.report_media[0].object_path;
          if (path.startsWith("http")) {
            imageUrl = path;
          } else {
            imageUrl = supabase.storage.from("report-images").getPublicUrl(path).data.publicUrl;
          }
        }

        const userProf = data.user_profiles as { display_name?: string; avatar_path?: string } | null;
        const repCat = data.report_categories as { name_id?: string; name_en?: string } | null;

        setReport({
          id: data.id,
          type: data.report_type as "lost" | "found",
          title: data.title,
          description: data.description,
          category: repCat?.name_id || "Lainnya",
          location_name: data.location_label || data.city || "Indonesia",
          incident_date: formattedDate,
          status: itemStatus,
          image_url: imageUrl,
          author_name: userProf?.display_name || "Warga MuaraKu",
          author_avatar: userProf?.avatar_path || null,
          is_verified_staff: false,
        });
      }
      setLoading(false);
    }

    loadReport();
  }, [reportId, supabase]);

  const handleTranslate = async () => {
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }

    if (translatedText) {
      setShowTranslated(true);
      return;
    }

    if (!report) return;

    setIsTranslating(true);
    try {
      const targetLang = locale === "id" ? "en" : "id";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: report.id,
          text: report.description,
          target_language: targetLang,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setTranslatedText(json.translated_text);
        setShowTranslated(true);
      } else {
        // Fallback message
        setTranslatedText(
          locale === "en"
            ? "Translation service is temporarily unavailable. Displaying original text."
            : "Layanan terjemahan sedang tidak tersedia. Menampilkan teks asli."
        );
        setShowTranslated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-xs text-zinc-500">Memuat rincian laporan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <Search className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Laporan Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-500">
          Laporan yang Anda cari mungkin sudah ditutup, dikembalikan, atau telah dihapus oleh pelapor.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Feed Discover</span>
        </Link>
      </div>
    );
  }

  const isLost = report.type === "lost";

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Feed</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Bagikan Tautan"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {copiedLink ? "Tersalin!" : "Bagikan"}
            </span>
          </button>

          {/* Safety Flag */}
          <button
            onClick={() => setSafetyModalOpen(true)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-50 transition-colors"
            title="Laporkan Postingan Ini"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm space-y-6">
        {/* Large Media Photo */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          {report.image_url ? (
            <img
              src={report.image_url}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-850">
              <div className="w-16 h-16 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                {isLost ? <Search className="w-8 h-8 text-orange-500" /> : <Package className="w-8 h-8 text-emerald-500" />}
              </div>
              <span className="text-xs font-semibold text-zinc-400">Foto publik tidak dilampirkan</span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold shadow-sm backdrop-blur-md ${
                isLost ? "bg-rose-500/90 text-white" : "bg-emerald-600/90 text-white"
              }`}
            >
              {isLost ? "Laporan Kehilangan" : "Laporan Temuan"}
            </span>

            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 shadow-sm">
              {report.category}
            </span>
          </div>

          <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-950/70 text-white backdrop-blur-md">
            #{report.id.slice(0, 8)}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title & Author Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {report.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <strong>{report.location_name}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  {report.incident_date}
                </span>
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 self-start">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                {report.author_avatar ? (
                  <img src={report.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  report.author_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>{report.author_name}</span>
                  {report.is_verified_staff && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Petugas</span>
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-zinc-400">Pelapor Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Public Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Deskripsi Visual Barang
              </h2>

              {/* Translation Button On Demand */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50"
              >
                {isTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                <span>
                  {showTranslated ? t.common.show_original : t.common.translate_button}
                </span>
              </button>
            </div>

            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
              {showTranslated && translatedText ? translatedText : report.description}
            </p>
          </div>

          {/* Privacy Security Box */}
          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 flex items-start gap-3">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-900 dark:text-orange-200 leading-relaxed">
              <strong>Proteksi Bukti Kepemilikan:</strong> Ciri unik tersembunyi (nomor seri, ciri bagian dalam) dirahasiakan oleh sistem. Pengklaim wajib membuktikan kepemilikan melalui alur verifikasi privat sebelum kontak diserahkan.
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            {!isLost ? (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Klaim Kepemilikan Barang Ini</span>
              </button>
            ) : (
              <button
                onClick={() => router.push(`/app/messages?reportId=${report.id}`)}
                className="w-full sm:flex-1 py-3.5 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm shadow-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Hubungi Pemilik / Pelapor</span>
              </button>
            )}

            <button
              onClick={() => router.push(`/app/messages?reportId=${report.id}`)}
              className="w-full sm:w-auto py-3.5 px-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Buka Koordinasi Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        report={report}
      />

      {/* Safety Report Modal */}
      <SafetyReportModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        targetType="report"
        targetId={report.id}
        targetTitle={report.title}
      />
    </div>
  );
}
