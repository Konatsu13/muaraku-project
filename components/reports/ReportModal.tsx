"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  FilePlus,
  Search,
  CheckCircle,
  Lock,
  ShieldCheck,
  MapPin,
  Calendar,
  Upload,
  AlertCircle,
  Loader2,
  Warehouse,
} from "lucide-react";
import { ReportItem } from "./ReportCard";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "lost" | "found";
  onReportCreated?: (report: ReportItem) => void;
}

export function ReportModal({
  isOpen,
  onClose,
  defaultType = "lost",
  onReportCreated,
}: ReportModalProps) {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const supabase = createClient();

  const [type, setType] = useState<"lost" | "found">(defaultType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Elektronik");
  const [locationName, setLocationName] = useState("");
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secretClue, setSecretClue] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [depositAtDesk, setDepositAtDesk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    "Elektronik",
    "Dompet & kartu",
    "Tas & ransel",
    "Kunci & aksesori",
    "Buku & dokumen",
    "Perlengkapan",
    "Identitas",
    "Lainnya",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const newReportId = `rep-${Date.now()}`;
      const newReport: ReportItem = {
        id: newReportId,
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location_name: locationName.trim(),
        incident_date: "Baru saja",
        status: "active",
        image_url:
          imageUrl.trim() ||
          (type === "lost"
            ? "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80"),
        author_name: profile?.display_name || user?.email?.split("@")[0] || "Warga MuaraKu",
        is_verified_staff: depositAtDesk,
      };

      // Try inserting into Supabase if authenticated
      if (user) {
        try {
          await supabase.from("reports").insert({
            user_id: user.id,
            report_type: type,
            title: title.trim(),
            description: description.trim(),
            location_freeform: locationName.trim(),
            incident_at: new Date(incidentDate).toISOString(),
            status: "active",
          });

          // Insert private secret clues to report_private_details
          if (secretClue) {
            await supabase.from("report_private_details").insert({
              report_id: newReportId,
              private_clues: secretClue.trim(),
              private_serial_number: serialNumber.trim() || null,
            });
          }
        } catch (dbErr) {
          console.warn("Supabase insert notice (fallback to memory):", dbErr);
        }
      }

      if (onReportCreated) {
        onReportCreated(newReport);
      }

      setSuccessMsg("Laporan berhasil diterbitkan!");
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        // Reset form
        setTitle("");
        setDescription("");
        setLocationName("");
        setSecretClue("");
        setSerialNumber("");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan laporan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header with Type Toggle */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {type === "lost" ? t.reports.modal_title_lost : t.reports.modal_title_found}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sistem temu kembali sipil dengan enkripsi ciri privat
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

          {/* Toggle Type Finder vs Seeker */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setType("found")}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === "found"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Lapor Temuan (Finder)</span>
            </button>
            <button
              type="button"
              onClick={() => setType("lost")}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === "lost"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Search className="w-4 h-4 text-orange-500" />
              <span>Lapor Kehilangan (Seeker)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= BAGIAN 1: ATRIBUT PUBLIK ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  BAGIAN 1
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Atribut Publik (Tampil di Feed)
                </span>
              </div>
              <span className="text-xs text-zinc-400">Dilihat seluruh warga</span>
            </div>

            {/* Judul Laporan */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.reports.field_title} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.reports.field_title_placeholder}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Kategori Pills */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.reports.field_category} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                      category === cat
                        ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi & Waktu Kejadian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.reports.field_location} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t.reports.field_location_placeholder}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.reports.field_date} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi Publik Aman */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.reports.field_description}
                </label>
                <span className="text-[11px] text-zinc-400">Hindari ciri rahasia di sini</span>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.reports.field_description_placeholder}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Foto Barang */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.reports.field_photos} (URL Gambar / Pratinjau)
              </label>
              <div className="relative">
                <Upload className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (atau biarkan kosong untuk foto standar)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* ================= BATAS ENKRIPSI PRIVASI SIPIL ================= */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-zinc-300 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FFFCF8] dark:bg-[#18181B] px-3.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Batas Enkripsi Privasi Sipil
              </span>
            </div>
          </div>

          {/* ================= BAGIAN 2: DATA VERIFIKASI PRIVAT ================= */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-500/30 bg-orange-500/[0.04] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    {t.reports.private_section_badge}
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {t.reports.private_section_title}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {t.reports.private_section_desc}
                </p>
              </div>
            </div>

            {/* Input Ciri Rahasia 1 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                {t.reports.private_clue_label} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={secretClue}
                onChange={(e) => setSecretClue(e.target.value)}
                placeholder={t.reports.private_clue_placeholder}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Pencari sah wajib membuktikan ciri ini secara tepat saat mengajukan klaim.
              </p>
            </div>

            {/* Input Ciri Rahasia 2 (Nomor Seri / IMEI) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Nomor Seri / IMEI / Inisial Khusus (Opsional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Misal: S/N gawai, 4 digit akhir kartu ATM, inisial di balik resleting"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Toggle Titipkan di Pos Petugas */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Warehouse className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Titipkan ke Pos Petugas Resmi?
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Barang diserahkan ke satpam/posko kampus agar lebih aman.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={depositAtDesk}
                onChange={(e) => setDepositAtDesk(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-zinc-300 dark:border-zinc-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{type === "lost" ? t.reports.submit_lost : t.reports.submit_found}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
