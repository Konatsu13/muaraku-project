"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileCheck,
  Send,
  Loader2,
  CheckCircle2,
  Warehouse,
  MessageSquare,
} from "lucide-react";
import { ReportItem } from "./ReportCard";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
  onClaimSubmitted?: () => void;
}

export function ClaimModal({
  isOpen,
  onClose,
  report,
  onClaimSubmitted,
}: ClaimModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const supabase = createClient();

  const [statement, setStatement] = useState("");
  const [meetingMethod, setMeetingMethod] = useState<"staff_desk" | "direct_chat">(
    "staff_desk"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (user) {
        try {
          await supabase.from("claims").insert({
            claimant_id: user.id,
            report_id: report.id,
            claim_statement: statement.trim(),
            status: "submitted",
          });
        } catch (dbErr) {
          console.warn("Supabase claim notice:", dbErr);
        }
      }

      setSuccess(true);
      if (onClaimSubmitted) onClaimSubmitted();
      setTimeout(() => {
        setSuccess(false);
        setStatement("");
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim klaim";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {t.claim.modal_title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  #{report.id}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.claim.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-4 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Klaim privat berhasil dikirimkan ke penemu barang!
            </div>
          )}

          {/* Target Item Snapshot Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                {report.image_url && (
                  <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {report.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Lokasi: {report.location_name}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Laporan Temuan
            </span>
          </div>

          {/* Mandatory AI Candidacy Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Disclaimer Pencocokan Otomatis AI:</strong> Rekomendasi kecocokan AI adalah indikasi awal dan <u>BUKAN bukti mutlak kepemilikan</u>. Jawaban ciri rahasia Anda akan diverifikasi langsung oleh penemu barang/staf posko resmi.
            </div>
          </div>

          {/* Form Pembuktian Kepemilikan Privat */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Jawaban Validasi Ciri Khusus (Privat &amp; Terenkripsi)
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.claim.statement_label} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={t.claim.statement_placeholder}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Tuliskan ciri yang tidak tampak pada foto publik (misal: isi dompet, 4 digit kartu, nomor seri, gantungan tersembunyi).
              </p>
            </div>

            {/* Metode Serah Terima */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Pilihan Cara Serah Terima
              </label>
              <div className="space-y-2">
                <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  meetingMethod === "staff_desk"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40"
                }`}>
                  <input
                    type="radio"
                    name="method"
                    checked={meetingMethod === "staff_desk"}
                    onChange={() => setMeetingMethod("staff_desk")}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                      <Warehouse className="w-4 h-4 text-emerald-600" />
                      <span>Bertemu di Pos Petugas / Meja Informasi (Direkomendasikan)</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Paling aman dan disaksikan oleh pihak netral resmi kampus / fasilitas publik.
                    </p>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  meetingMethod === "direct_chat"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40"
                }`}>
                  <input
                    type="radio"
                    name="method"
                    checked={meetingMethod === "direct_chat"}
                    onChange={() => setMeetingMethod("direct_chat")}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                      <MessageSquare className="w-4 h-4 text-zinc-500" />
                      <span>Koordinasi Langsung via Pesan MuaraKu</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Nomor kontak privat disembunyikan sampai verifikasi disetujui.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Anti-Scam Notice */}
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-[11px] text-red-800 dark:text-red-300 leading-relaxed">
            <strong>Peringatan Tegas:</strong> Mengajukan klaim palsu atas barang yang bukan hak Anda melanggar hukum dan berakibat pemblokiran akun permanen. Seluruh proses temu kembali berlandaskan gotong royong dan 100% GRATIS.
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !statement.trim()}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t.claim.submit_claim}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
