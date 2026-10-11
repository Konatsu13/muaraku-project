"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Send,
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

export function SafetyReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: SafetyReportModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [reason, setReason] = useState("scam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        try {
          await supabase.from("safety_reports").insert({
            reporter_id: user.id,
            target_type: targetType,
            target_id: targetId,
            reason_category: reason,
            details: details.trim(),
            status: "new",
          });
        } catch (dbErr) {
          console.warn("Safety report notice:", dbErr);
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails("");
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Laporkan Pelanggaran
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Laporan Anda telah diterima dan akan ditinjau oleh tim moderasi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {targetTitle && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-300">
                Target: <strong>{targetTitle}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Alasan Pelaporan <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="scam">Dugaan Penipuan / Pemerasan Imbalan</option>
                <option value="fake_info">Informasi Palsu / Foto Menyesatkan</option>
                <option value="spam">Spam / Iklan yang Tidak Relevan</option>
                <option value="harassment">Pelecehan / Kata-kata Tidak Pantas</option>
                <option value="doxxing">Penyebaran Data Pribadi Tanpa Izin</option>
                <option value="other">Alasan Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Keterangan Tambahan
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Berikan bukti atau penjelasan singkat..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-500 leading-relaxed">
              Identitas Anda dirahasiakan dan tidak akan diberitahukan kepada pihak yang dilaporkan.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
