"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  X,
  ShieldCheck,
  Lock,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  ReportDetailItem,
  createClaim,
  fetchReports,
} from "@/lib/supabase/reports";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundReport: ReportDetailItem | null;
  onClaimSubmitted?: () => void;
  onRequestCreateLostReport?: () => void;
}

export function ClaimModal({
  isOpen,
  onClose,
  foundReport,
  onClaimSubmitted,
  onRequestCreateLostReport,
}: ClaimModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [myLostReports, setMyLostReports] = useState<ReportDetailItem[]>([]);
  const [selectedLostReportId, setSelectedLostReportId] = useState<string>("");
  const [claimantMessage, setClaimantMessage] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNote, setEvidenceNote] = useState("");

  const [loadingMyReports, setLoadingMyReports] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch claimant's lost reports
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let cancelled = false;
    // Defer one tick so the effect body does not call setState synchronously
    // (react-hooks/set-state-in-effect).
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoadingMyReports(true);
      fetchReports({
        type: "lost",
        reporter_user_id: user.id,
      }).then((res) => {
        if (cancelled) return;
        setLoadingMyReports(false);
        if (res.data) {
          setMyLostReports(res.data);
          if (res.data.length > 0) {
            setSelectedLostReportId(res.data[0].id);
          }
        }
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, user?.id]);

  if (!isOpen || !foundReport) return null;

  const isOwnerOfFound = Boolean(user && user.id === foundReport.reporter_user_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg("Harap masuk terlebih dahulu untuk mengajukan klaim.");
      return;
    }

    if (isOwnerOfFound) {
      setErrorMsg("Anda adalah pembuat laporan temuan ini sehingga tidak dapat mengklaim barang Anda sendiri.");
      return;
    }

    if (!selectedLostReportId) {
      setErrorMsg("Pilih laporan kehilangan Anda sebagai penaut verifikasi.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createClaim({
        found_report_id: foundReport.id,
        lost_report_id: selectedLostReportId,
        claimant_message: claimantMessage.trim() || undefined,
        evidence_file: evidenceFile || undefined,
        evidence_note: evidenceNote.trim() || undefined,
      });

      if (res.error || !res.data) {
        throw new Error(res.error?.message || "Gagal mengirimkan klaim ke database");
      }

      setSuccess(true);
      if (onClaimSubmitted) onClaimSubmitted();

      setTimeout(() => {
        setSuccess(false);
        setClaimantMessage("");
        setEvidenceFile(null);
        setEvidenceNote("");
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses klaim";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#121214] w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Ajukan Klaim Kepemilikan
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verifikasi kepemilikan barang temuan secara privat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Klaim berhasil didaftarkan dan sedang ditinjau.</span>
            </div>
          )}

          {/* Target Item summary */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="text-zinc-500 block text-[10px]">Barang yang ingin diklaim:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                {foundReport.title}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
              Barang Temuan
            </span>
          </div>

          {/* Linked Lost Report Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tautkan dengan Laporan Kehilangan Anda <span className="text-rose-500">*</span>
            </label>

            {loadingMyReports ? (
              <div className="p-3 text-xs text-zinc-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memeriksa laporan kehilangan Anda...</span>
              </div>
            ) : myLostReports.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-2">
                <p className="text-amber-800 dark:text-amber-300">
                  Anda belum memiliki laporan kehilangan yang terdaftar. Sesuai aturan keamanan MuaraKu, klaim memerlukan laporan kehilangan resmi sebagai bukti penaut.
                </p>
                {onRequestCreateLostReport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestCreateLostReport();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-500 transition-colors text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Laporan Kehilangan Sekarang</span>
                  </button>
                )}
              </div>
            ) : (
              <select
                required
                value={selectedLostReportId}
                onChange={(e) => setSelectedLostReportId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {myLostReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.location_label || r.city || "Lokasi tidak disebutkan"})
                  </option>
                ))}
              </select>
            )}
            <span className="text-[10px] text-zinc-400 mt-1 block">
              Hanya pemilik sah laporan kehilangan tertaut yang dapat mengklaim.
            </span>
          </div>

          {/* Message for Finder / Staff */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Pesan Verifikasi &amp; Ciri Spesifik
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={claimantMessage}
              onChange={(e) => setClaimantMessage(e.target.value)}
              placeholder="Jelaskan bukti tambahan, ciri yang hanya Anda ketahui, atau waktu persis Anda kehilangan barang ini..."
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Unggah Berkas Bukti Privat (Opsional, maks 8MB)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setEvidenceFile(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 rounded-xl p-3 flex items-center justify-between cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50 text-xs"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {evidenceFile ? evidenceFile.name : "Pilih bukti foto struk/nota, kartu garansi, atau dokumen"}
                </span>
              </div>
              {evidenceFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEvidenceFile(null);
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {evidenceFile && (
              <div className="mt-2">
                <input
                  type="text"
                  maxLength={1500}
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="Catatan pendukung untuk bukti ini..."
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <span>
              Berkas bukti disimpan di bucket privat <code>claim-evidence</code> dan hanya dapat diakses oleh peserta klaim dan staf moderator.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || myLostReports.length === 0 || isOwnerOfFound}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Kirimkan Klaim</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
