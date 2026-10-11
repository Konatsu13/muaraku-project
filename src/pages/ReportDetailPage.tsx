import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { Report, ItemCategory, ReportStatus } from '../types';

interface ReportDetailPageProps {
  report: Report;
  onBack: () => void;
  onOpenClaimModal: (report: Report) => void;
  onOpenChatWithReporter: (report: Report) => void;
  onOpenModerationModal: (report: Report) => void;
  onReportUpdated?: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Dompet & Kartu',
  'Elektronik',
  'Kunci & Aksesori',
  'Buku & Dokumen',
  'Tas & Pakaian',
  'Lainnya',
];

const STATUS_OPTIONS: ReportStatus[] = [
  'Open',
  'Potential Match',
  'Claim in Progress',
  'Returned',
  'Closed',
];

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  report: initialReport,
  onBack,
  onOpenClaimModal,
  onOpenChatWithReporter,
  onOpenModerationModal,
  onReportUpdated,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [report, setReport] = useState<Report>(initialReport);
  const [selectedImage, setSelectedImage] = useState(initialReport.image_url);
  const [isTranslated, setIsTranslated] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([
    'Telah diamankan di pos petugas sekolah. Bagi yang merasa pemilik, silakan ajukan klaim.',
  ]);

  // Edit Mode state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(initialReport.title);
  const [editCategory, setEditCategory] = useState<ItemCategory>(initialReport.category);
  const [editLocation, setEditLocation] = useState(initialReport.facility_location);
  const [editLocationDetail, setEditLocationDetail] = useState(initialReport.location_detail || '');
  const [editDescription, setEditDescription] = useState(initialReport.public_description);
  const [editStatus, setEditStatus] = useState<ReportStatus>(initialReport.status);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isOwner = Boolean(currentUser && currentUser.id === report.reporter_id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [...prev, `${currentUser?.name || 'Warga'}: ${commentText}`]);
    setCommentText('');
    showToast('Komentar berhasil dipublikasikan pada log catatan.', 'success');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast('Anda tidak memiliki izin untuk mengedit laporan ini.', 'error');
      return;
    }

    if (!editTitle.trim() || !editDescription.trim()) {
      showToast('Harap lengkapi judul dan deskripsi laporan.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await db.updateReport(report.id, {
        title: editTitle.trim(),
        category: editCategory,
        facility_location: editLocation.trim(),
        location_detail: editLocationDetail.trim(),
        public_description: editDescription.trim(),
        status: editStatus,
      });

      if (updated) {
        setReport(updated);
        showToast('Laporan berhasil diperbarui!', 'success');
        setIsEditModalOpen(false);
        if (onReportUpdated) onReportUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui laporan.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const images = [report.image_url, ...(report.additional_images || [])];

  // Lifecycle steps for the tracker
  const steps = [
    { label: 'Didaftarkan', icon: 'app_registration', done: true },
    {
      label: 'Diverifikasi Satpam',
      icon: 'verified_user',
      done: Boolean(report.is_dropped_at_staff_pos || report.reporter_is_staff),
    },
    {
      label: 'Klaim / Pencocokan',
      icon: 'contact_support',
      done: report.status === 'Claim in Progress' || report.status === 'Potential Match' || report.status === 'Returned' || report.status === 'Closed',
    },
    {
      label: 'Selesai Diserahkan',
      icon: 'task_alt',
      done: report.status === 'Returned' || report.status === 'Closed',
    },
  ];

  return (
    <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1440px] w-full mx-auto space-y-7">
      {/* Back button and tracking code bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white px-3.5 py-2 rounded-xl glass-surface border border-border-subtle/80 dark:border-dark-border active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali ke Katalog</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono glass-surface border border-border-subtle/80 dark:border-dark-border text-secondary-ink dark:text-muted-text shadow-xs">
            {report.report_code}
          </span>

          {/* Owner Edit Button */}
          {isOwner && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
              title="Edit Data Laporan Saya"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Laporan Saya</span>
            </button>
          )}

          <button
            onClick={() => onOpenModerationModal(report)}
            className="p-2 rounded-xl glass-surface border border-border-subtle/80 dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-muted-text hover:text-error-destructive active:scale-95 transition-all"
            title="Laporkan Konten Tidak Sesuai"
          >
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </button>
        </div>
      </div>

      {/* Status Progress Tracker Bar */}
      <div className="glass-surface rounded-2xl sm:rounded-3xl border border-border-subtle/80 dark:border-white/10 p-4 sm:p-6 shadow-xs inner-light">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-on-surface dark:text-surface-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary-container">timeline</span>
            Status Alur Temu Kembali Sipil
          </span>
          <span className="text-[11px] font-semibold text-primary-container capitalize px-2.5 py-0.5 rounded-full bg-primary-container/10">
            Tahap Aktif: {report.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {steps.map((st, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                st.done
                  ? 'bg-primary-container/10 border-primary-container/30 text-on-surface dark:text-surface-white shadow-2xs'
                  : 'bg-soft-surface/50 dark:bg-dark-surface/50 border-border-subtle dark:border-dark-border/40 opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  st.done
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-muted-text'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{st.icon}</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-muted-text block">0{i + 1}</span>
                <p className="text-xs font-semibold truncate">{st.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Media & Security Vault / Right Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Column (6 cols): Media Gallery & Zero Knowledge Explainer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-4 sm:p-5 shadow-sm space-y-4 inner-light">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-soft-surface dark:bg-dark-canvas border border-border-subtle dark:border-dark-border">
              <img
                src={selectedImage}
                alt={report.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                    report.report_type === 'found'
                      ? 'bg-secondary/90 text-white'
                      : 'bg-primary-container/90 text-white'
                  }`}
                >
                  {report.report_type === 'found' ? 'Barang Ditemukan' : 'Barang Hilang'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-md">
                  {report.category}
                </span>
              </div>
            </div>

            {/* Thumbnail switcher if additional images exist */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-primary-container scale-105 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zero Knowledge Vault Security Explanation Card */}
          <div className="glass-surface rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.02] p-5 sm:p-6 shadow-xs space-y-3.5 inner-light">
            <div className="flex items-center gap-2.5 text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
              <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface dark:text-surface-white">
                Protokol Zero-Knowledge Vault Aktif
              </h3>
            </div>
            <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
              Ciri rahasia khusus dan nomor seri unik pada barang ini tersimpan dalam basis data terenkripsi. Pengklaim wajib membuktikan deskripsi isi rahasia yang identik sebelum verifikasi fisik di pos resmi dilakukan.
            </p>
            <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-text font-mono border-t border-border-subtle/60 dark:border-white/10">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Anti-Klaim Palsu
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verifikasi Otoritas Pos
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Incident Meta, Reporter Profile, Actions, & Comments */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-5 inner-light">
            <div className="space-y-2">
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-surface-white tracking-tight">
                {report.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-text font-mono">
                <span className="material-symbols-outlined text-[15px] text-primary-container">calendar_today</span>
                <span>
                  Kejadian: {new Date(report.incident_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Location Banner */}
            <div className="p-4 rounded-2xl glass-surface border border-border-subtle/80 dark:border-dark-border flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[22px]">location_on</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface dark:text-surface-white truncate">
                  {report.facility_location}
                </p>
                {report.location_detail && (
                  <p className="text-xs text-secondary-ink dark:text-muted-text mt-0.5 leading-relaxed">
                    {report.location_detail}
                  </p>
                )}
                {report.is_dropped_at_staff_pos && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1.5">
                    <span className="material-symbols-outlined text-[15px]">warehouse</span>
                    Tersimpan di Pos Penjagaan Satpam Resmi
                  </span>
                )}
              </div>
            </div>

            {/* Public Description with Translation toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface dark:text-surface-white">
                  Deskripsi Visual Publik
                </span>
                <button
                  onClick={() => setIsTranslated(!isTranslated)}
                  className="text-[11px] text-primary-container font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">translate</span>
                  <span>{isTranslated ? 'Lihat Teks Asli' : 'Formalisasikan Bahasa'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed p-4 glass-surface rounded-2xl border border-border-subtle/70 dark:border-dark-border/70">
                {isTranslated
                  ? `[Terjemahan Baku]: Objek tersebut berupa ${report.title.toLowerCase()}, diamankan di area ${report.facility_location}. Berdasarkan pengamatan visual luar: ${report.public_description}`
                  : report.public_description}
              </p>
            </div>

            {/* Reporter Profile Lockup */}
            <div className="p-3.5 rounded-2xl glass-surface border border-border-subtle/70 dark:border-dark-border/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    report.reporter_avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(report.reporter_name)}`
                  }
                  alt={report.reporter_name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-container/20 border border-border-subtle"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface dark:text-surface-white">
                      {report.reporter_name}
                    </span>
                    {report.reporter_is_staff && (
                      <span
                        className="material-symbols-outlined text-tertiary-container text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        title="Petugas Lokasi Terverifikasi"
                      >
                        verified
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-text">
                    {report.reporter_staff_badge || 'Warga Terdaftar'}
                  </span>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={() => onOpenChatWithReporter(report)}
                  className="px-3.5 py-1.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-dark-border hover:text-on-surface text-xs font-semibold text-secondary-ink dark:text-muted-text active:scale-95 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary-container">chat</span>
                  <span>Kirim Pesan</span>
                </button>
              )}
            </div>

            {/* Main Action CTAs */}
            <div className="space-y-2 pt-2">
              {isOwner ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-3.5 rounded-xl btn-premium text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all ring-1 ring-white/30"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  <span>Kelola & Edit Laporan Saya</span>
                </button>
              ) : report.report_type === 'found' ? (
                <button
                  onClick={() => onOpenClaimModal(report)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all ring-1 ring-white/30"
                >
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                  <span>Klaim Milik Saya (Verifikasi Kuis Rahasia)</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenChatWithReporter(report)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all ring-1 ring-white/30"
                >
                  <span className="material-symbols-outlined text-[20px]">handshake</span>
                  <span>Saya Menemukan Barang Ini / Beri Info</span>
                </button>
              )}
            </div>
          </div>

          {/* Activity Comments Log */}
          <div className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-6 shadow-sm space-y-4 inner-light">
            <h3 className="font-bold text-sm text-on-surface dark:text-surface-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">forum</span>
              <span>Catatan Komunitas & Log Penyerahan Fisik</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar text-xs">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 glass-surface rounded-xl text-secondary-ink dark:text-muted-text leading-relaxed border border-border-subtle/60 dark:border-dark-border/60 shadow-2xs"
                >
                  {c}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis catatan atau update status..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl input-premium text-on-surface dark:text-surface-white placeholder:text-muted-text focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Own Report Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-surface w-full max-w-lg rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-2xl p-6 space-y-5 inner-light card-premium max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white">
                    Edit Laporan Saya
                  </h3>
                  <p className="text-[11px] text-muted-text font-mono">Kode: {report.report_code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-muted-text"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-on-surface dark:text-surface-white">Judul Laporan</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-on-surface dark:text-surface-white">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-on-surface dark:text-surface-white">Status Laporan</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none font-semibold text-orange-600 dark:text-orange-400"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-on-surface dark:text-surface-white">Lokasi Fasilitas</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-on-surface dark:text-surface-white">Detail Titik Lokasi</label>
                <input
                  type="text"
                  value={editLocationDetail}
                  onChange={(e) => setEditLocationDetail(e.target.value)}
                  placeholder="Misal: Meja nomor 4 lantai 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-on-surface dark:text-surface-white">Deskripsi Publik</label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas input-premium text-xs focus:border-orange-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border text-secondary-ink dark:text-muted-text font-semibold hover:bg-soft-surface transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 rounded-xl btn-premium text-white font-bold shadow-md shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ReportDetailPage;
