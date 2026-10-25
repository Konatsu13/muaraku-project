"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  fetchReportById,
  deleteReport,
  setReportStatus,
  toggleSaveReport,
  fetchClaimsForReport,
  ReportDetailItem,
  ClaimItem,
} from "@/lib/supabase/reports";
import { ReportModal } from "@/components/reports/ReportModal";
import { ClaimModal } from "@/components/reports/ClaimModal";
import { formatOccurredAt } from "@/lib/reports/occurred-at";
import { createDirectConversation } from "@/lib/supabase/messages";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Bookmark,
  Share2,
  Lock,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Package,
  Search,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;

  const [report, setReport] = useState<ReportDetailItem | null>(null);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [createLostModalOpen, setCreateLostModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [copiedLink, setCopiedLink] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const loadReport = useCallback(async (isCancelledRef?: { current: boolean }) => {
    if (isCancelledRef?.current) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await fetchReportById(reportId);
    if (isCancelledRef?.current) return;
    if (res.error || !res.data) {
      setErrorMsg(res.error?.message || "Laporan tidak ditemukan");
      setReport(null);
    } else {
      setReport(res.data);

      // If user is owner or involved, fetch claims
      if (user && user.id === res.data.reporter_user_id) {
        const claimsRes = await fetchClaimsForReport(reportId);
        if (isCancelledRef?.current) return;
        if (claimsRes.data) {
          setClaims(claimsRes.data);
        }
      }
    }
    if (isCancelledRef?.current) return;
    setLoading(false);
  }, [reportId, user?.id]);

  useEffect(() => {
    const isCancelledRef = { current: false };
    // Defer one tick: the loader resets loading/error state synchronously,
    // which must not run during the effect body.
    const timer = setTimeout(() => {
      if (!isCancelledRef.current) loadReport(isCancelledRef);
    }, 0);
    return () => {
      isCancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [loadReport]);

  const isOwner = user && report && user.id === report.reporter_user_id;
  const canEditReport =
    report?.case_status === "open" || report?.case_status === "match_pending";
  const isLost = report?.report_type === "lost";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleSave = async () => {
    if (!report) return;
    const res = await toggleSaveReport(report.id);
    if (!res.error) {
      setReport((prev) => (prev ? { ...prev, is_saved: res.isSaved } : null));
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setDeleting(true);
    const res = await deleteReport(report.id);
    if (!res.success || res.error) {
      alert(`Gagal menghapus laporan: ${res.error?.message || "Terjadi kesalahan."}`);
      setDeleting(false);
    } else {
      if (res.warning) {
        alert(res.warning.message);
      }
      router.push("/app");
    }
  };

  const handleStatusChange = async (newStatus: "returned" | "open") => {
    if (!report) return;
    setUpdatingStatus(true);
    const res = await setReportStatus(report.id, newStatus);
    if (res.error) {
      alert(`Gagal mengubah status: ${res.error.message}`);
    } else {
      await loadReport();
    }
    setUpdatingStatus(false);
  };

  const handleContact = async () => {
    if (!report || !user || contacting) return;
    setContacting(true);
    setContactError(null);

    const res = await createDirectConversation(report.reporter_user_id, report.id);
    if (res.error || !res.conversationId) {
      setContactError(res.error?.message || "Percakapan tidak dapat dibuat.");
      setContacting(false);
      return;
    }

    router.push(`/app/messages?conversation=${res.conversationId}`);
    setContacting(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <LoadingPattern />
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorPattern
          message={errorMsg || "Laporan tidak ditemukan"}
          onRetry={loadReport}
        />
      </div>
    );
  }

  const formattedOccurred = (() => {
    if (!report.occurred_at) return "-";
    const formatted = formatOccurredAt(report.occurred_at, report.item_attributes);
    const datePart = formatted.weekday
      ? `${formatted.weekday}, ${formatted.date}`
      : formatted.date;
    return formatted.time ? `${datePart} · ${formatted.time}` : datePart;
  })();

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <Link
          href={isLost ? "/app/seeker" : "/app/finder"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke {isLost ? "Seeker Hub" : "Finder Hub"}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleCopyLink}
            title="Salin tautan"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {copiedLink ? "Tautan Disalin" : "Bagi Tautan"}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleToggleSave}
            title={report.is_saved ? "Hapus dari simpanan" : "Simpan laporan"}
            className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs ${
              report.is_saved
                ? "text-orange-500 fill-orange-500 bg-orange-50/50 dark:bg-orange-950/30"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${report.is_saved ? "fill-orange-500" : ""}`} />
            <span className="hidden sm:inline">
              {report.is_saved ? "Tersimpan" : "Simpan"}
            </span>
          </button>
        </div>
      </div>

      {/* Moderation Pending Banner */}
      {report.moderation_status === "pending_review" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-800 dark:text-amber-200 block">
              Laporan Sedang Ditinjau Moderator
            </span>
            <span className="text-amber-700 dark:text-amber-300">
              Laporan ini belum tampil di feed pencarian publik untuk menjaga keamanan dan mencegah penipuan. Sebagai pemilik, Anda tetap dapat melihat dan menyunting rincian ini.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Media & Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {report.media && report.media.length > 0 && report.media[selectedImageIndex]?.signed_url ? (
              <img
                src={report.media[selectedImageIndex].signed_url || ""}
                alt={report.title}
                className="w-full h-full object-contain bg-black/5 dark:bg-black/40"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 p-8 text-center">
                {isLost ? (
                  <Search className="w-12 h-12 stroke-[1.2] mb-2 opacity-50" />
                ) : (
                  <Package className="w-12 h-12 stroke-[1.2] mb-2 opacity-50" />
                )}
                <span className="text-xs font-medium text-zinc-400">
                  Foto barang tidak dilampirkan
                </span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  isLost
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60"
                }`}
              >
                {isLost ? "Barang Hilang" : "Barang Ditemukan"}
              </span>

              {report.case_status === "returned" && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Telah Dikembalikan
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail list if multiple images */}
          {report.media && report.media.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {report.media.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? "border-orange-500 scale-102"
                      : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={m.signed_url || ""} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Metadata, Attributes */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              {report.category_name && (
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {report.category_name}
                </span>
              )}
              <span>•</span>
              <span>Nomor Laporan: #{report.id.slice(0, 8)}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {report.title}
            </h1>
          </div>

          {/* Time & Location Metadata */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                  {report.location_label || "Lokasi tidak disebutkan"}
                </span>
                {report.city && (
                  <span className="text-[11px] text-zinc-500">{report.city}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block">Waktu Kejadian:</span>
                <span>{formattedOccurred}</span>
              </div>
            </div>
          </div>

          {/* Physical Attributes (Color, Brand, Model) */}
          {(report.color || report.brand || report.model) && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              {report.color && (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Warna</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{report.color}</span>
                </div>
              )}
              {report.brand && (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Merek</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{report.brand}</span>
                </div>
              )}
              {report.model && (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Model/Tipe</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{report.model}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
              Deskripsi Terbuka
            </h3>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap p-3.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
              {report.description}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
            {isOwner ? (
              <div className="space-y-2">
                {canEditReport && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Laporan</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}

                {/* Mark Returned Toggle */}
                {canEditReport ? (
                  <button
                    onClick={() => handleStatusChange("returned")}
                    disabled={updatingStatus}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Telah Dikembalikan</span>
                  </button>
                ) : report.case_status === "returned" ? (
                  <button
                    onClick={() => handleStatusChange("open")}
                    disabled={updatingStatus}
                    className="w-full py-2 px-3 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Buka Kembali Laporan
                  </button>
                ) : null}
                {!canEditReport && report.case_status !== "returned" && (
                  <p className="text-xs text-zinc-500">
                    Laporan dengan status ini tidak dapat diedit atau dihapus.
                  </p>
                )}
              </div>
            ) : !isLost ? (
              // Found report: other users can claim!
              <button
                onClick={() => setClaimModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ini Barang Saya (Ajukan Klaim)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                Punya informasi barang ini? Hubungi pelapor melalui pusat pesan atau laporkan temuan yang cocok.
              </div>
            )}

            {!isOwner && user && report.moderation_status === "approved" && (
              <div className="space-y-2">
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-orange-500/40 text-orange-700 dark:text-orange-300 bg-orange-500/10 hover:bg-orange-500/15 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {contacting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span>Hubungi {isLost ? "Pelapor" : "Penemu"} Barang</span>
                </button>
                {contactError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{contactError}</span>
                  </p>
                )}
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Percakapan privat dibuat melalui sistem MuaraKu. Jangan meminta atau
                  mengirim tebusan di luar aplikasi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner-Only Private Details Card */}
      {isOwner && report.private_details && (
        <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-zinc-100 dark:bg-[#121214] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Ciri Rahasia Khusus Pemilik (Hanya Anda yang Dapat Melihat)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {report.private_details.owner_only_clues && (
              <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-semibold">
                  CIRI RAHASIA (OWNER CLUES)
                </span>
                <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {report.private_details.owner_only_clues}
                </p>
              </div>
            )}

            {report.private_details.private_contact && (
              <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-semibold">
                  KONTAK PRIVAT
                </span>
                <p className="text-zinc-200">{report.private_details.private_contact}</p>
                <span className="text-[10px] text-zinc-400 block mt-1">
                  Metode: {report.private_details.contact_preference}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Claims Section (If Owner of Found Report) */}
      {isOwner && !isLost && claims.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Klaim Masuk ({claims.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              Verifikasi bukti sebelum menyerahkan barang
            </span>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Oleh: {claim.claimant_profile?.display_name || "Pengguna MuaraKu"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                    Status: {claim.status}
                  </span>
                </div>

                {claim.claimant_message && (
                  <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    &ldquo;{claim.claimant_message}&rdquo;
                  </p>
                )}

                {claim.lost_report && (
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span>Penaut:</span>
                    <Link
                      href={`/app/reports/${claim.lost_report_id}`}
                      className="text-orange-600 dark:text-orange-400 underline font-medium"
                    >
                      {claim.lost_report.title}
                    </Link>
                  </div>
                )}

                {claim.evidence && claim.evidence.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Bukti Kepemilikan Terlampir:
                    </span>
                    <div className="flex items-center gap-2">
                      {claim.evidence.map((ev) => (
                        <a
                          key={ev.id}
                          href={ev.signed_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Lihat Berkas Bukti</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Report Modal */}
      <ReportModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editReport={report}
        onSuccess={() => {
          loadReport();
        }}
      />

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        foundReport={report}
        onClaimSubmitted={() => {
          loadReport();
        }}
        onRequestCreateLostReport={() => {
          setCreateLostModalOpen(true);
        }}
      />

      {/* Create Lost Report Modal (if claimant has none) */}
      <ReportModal
        isOpen={createLostModalOpen}
        onClose={() => setCreateLostModalOpen(false)}
        defaultType="lost"
        onSuccess={() => {
          setClaimModalOpen(true);
        }}
      />
    </div>
  );
}
