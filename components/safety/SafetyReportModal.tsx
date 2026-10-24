"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface SafetyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "report" | "message" | "user";
  targetId: string;
  targetTitle?: string;
}

const REASON_OPTIONS = [
  { value: "scam_or_fraud", label: "Dugaan penipuan / pemerasan imbalan" },
  { value: "forced_payment", label: "Permintaan tebusan atau pembayaran paksa" },
  { value: "false_report", label: "Informasi atau foto menyesatkan" },
  { value: "spam", label: "Spam / iklan tidak relevan" },
  { value: "harassment", label: "Pelecehan atau kata-kata tidak pantas" },
  { value: "privacy_violation", label: "Penyebaran data pribadi tanpa izin" },
  { value: "impersonation", label: "Peniruan identitas" },
  { value: "unsafe_content", label: "Konten tidak aman" },
  { value: "other", label: "Alasan lainnya" },
];

export function SafetyReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: SafetyReportModalProps) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [reason, setReason] = useState("scam_or_fraud");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setReason("scam_or_fraud");
    setDetails("");
    setErrorMsg(null);
    setSubmitted(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg("Harap masuk terlebih dahulu untuk mengirim laporan keamanan.");
      return;
    }

    if (!targetId) {
      setErrorMsg("Target laporan tidak valid.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        reporter_user_id: user.id,
        target_type: targetType === "report" ? "item_report" : targetType,
        reason,
        details: details.trim() || null,
      };

      if (targetType === "message") payload.target_message_id = targetId;
      if (targetType === "report") payload.target_report_id = targetId;
      if (targetType === "user") payload.target_user_id = targetId;

      const { error } = await supabase.from("safety_reports").insert(payload);

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim laporan keamanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#121214] w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Laporkan Pelanggaran
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Tutup"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Laporan keamanan tersimpan dan akan ditinjau moderator.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {targetTitle && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800">
                Target: <strong className="text-zinc-900 dark:text-zinc-100">{targetTitle}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Alasan Pelaporan <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Keterangan Tambahan
              </label>
              <textarea
                rows={3}
                maxLength={2000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Jelaskan bukti atau kronologi singkat..."
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 leading-relaxed">
              Identitas pelapor hanya dapat dibaca oleh Anda dan tim moderasi, tidak
              ditampilkan kepada pihak yang dilaporkan.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Kirim Laporan ke Moderasi</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
