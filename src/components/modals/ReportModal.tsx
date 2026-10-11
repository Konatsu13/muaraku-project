import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db, uploadReportImage } from '../../lib/supabase';
import { ItemCategory, ReportType } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: () => void;
  defaultType?: ReportType;
}

const CATEGORIES: { label: ItemCategory; icon: string }[] = [
  { label: 'Dompet & Kartu', icon: 'wallet' },
  { label: 'Elektronik', icon: 'devices' },
  { label: 'Kunci & Aksesori', icon: 'key' },
  { label: 'Buku & Dokumen', icon: 'description' },
  { label: 'Tas & Pakaian', icon: 'backpack' },
  { label: 'Lainnya', icon: 'more_horiz' },
];

const LOCATIONS = [
  'Gedung Kelas & Selasar Lantai 1-3',
  'Perpustakaan Pusat & Ruang Baca',
  'Area Parkir Motor & Sepeda',
  'Kantin Sekolah / Pujasera',
  'Laboratorium Komputer & Sains',
  'Lapangan Olahraga & Gymnasium',
  'Stasiun KRL Gambir / Juanda',
  'Halte TransJakarta / Angkot Sekolah',
  'Lainnya (Tulis di Catatan Lokasi)',
];

// Sample item image presets for rapid creation
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
  defaultType = 'found',
}) => {
  const { currentUser, isAuthenticated, openAuthModal, setTargetRedirect } = useAuth();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState<ReportType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Dompet & Kartu');
  const [facilityLocation, setFacilityLocation] = useState(LOCATIONS[0]);
  const [locationDetail, setLocationDetail] = useState('');
  const [incidentTime, setIncidentTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [publicDescription, setPublicDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Private Clues (Zero-Knowledge)
  const [secretClue, setSecretClue] = useState('');
  const [secretSerial, setSecretSerial] = useState('');
  const [isDroppedAtPos, setIsDroppedAtPos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadReportImage(file);
      setImageUrl(uploadedUrl);
      showToast('Foto barang berhasil diunggah!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengunggah foto.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  // Enforce authentication check: if user is not authenticated, prompt login
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="glass-surface w-full max-w-md rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-2xl p-6 text-center space-y-4 inner-light card-premium">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-title-md text-lg font-bold text-on-surface dark:text-surface-white">
              Masuk untuk Melapor
            </h3>
            <p className="text-xs text-secondary-ink dark:text-muted-text">
              Untuk menjaga validitas laporan dan keamanan komunitas, Anda harus masuk ke akun MuaraKu terlebih dahulu.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border text-xs font-semibold text-secondary-ink dark:text-muted-text hover:bg-soft-surface transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetRedirect?.('report');
                openAuthModal?.('login');
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl btn-premium text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
            >
              Masuk Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publicDescription.trim()) {
      showToast('Harap lengkapi judul dan deskripsi barang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const isStaffUser = currentUser.role === 'staff' || currentUser.role === 'admin';
      const staffBadge =
        currentUser.role === 'staff'
          ? 'Petugas Satpam Pos'
          : currentUser.role === 'admin'
          ? 'Admin Tata Usaha'
          : undefined;

      await db.createReport({
        report_type: reportType,
        title,
        category,
        facility_location: facilityLocation,
        location_detail: locationDetail,
        incident_time: incidentTime,
        public_description: publicDescription,
        image_url: imageUrl,
        secret_clue: secretClue,
        secret_serial: secretSerial,
        is_dropped_at_staff_pos: isDroppedAtPos,
        status: 'Open',
        reporter_id: currentUser.id,
        reporter_name: currentUser.name,
        reporter_avatar: currentUser.avatar_url,
        reporter_is_staff: isStaffUser,
        reporter_staff_badge: staffBadge,
      });

      showToast(
        `Laporan ${reportType === 'found' ? 'Temuan' : 'Kehilangan'} berhasil diterbitkan ke sistem!`,
        'success'
      );
      if (onReportCreated) onReportCreated();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Gagal menerbitkan laporan. Silakan coba kembali.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-surface w-full max-w-2xl rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[92vh] overflow-hidden inner-light card-premium">
        {/* Header with Type Toggle */}
        <div className="p-5 sm:p-6 border-b border-border-subtle/70 dark:border-dark-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <span className="material-symbols-outlined text-[22px]">post_add</span>
              </div>
              <div>
                <h2 className="font-title-md text-base sm:text-lg font-bold text-on-surface dark:text-surface-white tracking-tight">
                  Buat Laporan Barang
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-secondary-ink dark:text-muted-text text-xs">
                    Pelapor:
                  </span>
                  <span className="text-xs font-semibold text-primary-container">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-soft-surface dark:bg-dark-border text-muted-text">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border-subtle dark:border-dark-border hover:bg-soft-surface dark:hover:bg-dark-canvas text-muted-text hover:text-on-surface flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Toggle: Finder vs Seeker */}
          <div className="grid grid-cols-2 p-1.5 bg-soft-surface/80 dark:bg-dark-canvas/80 rounded-2xl border border-border-subtle dark:border-dark-border gap-1.5">
            <button
              type="button"
              onClick={() => setReportType('found')}
              className={`py-2 px-3 rounded-xl font-label-md text-xs sm:text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                reportType === 'found'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Saya Menemukan (Finder)</span>
            </button>

            <button
              type="button"
              onClick={() => setReportType('lost')}
              className={`py-2 px-3 rounded-xl font-label-md text-xs sm:text-sm font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                reportType === 'lost'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Saya Kehilangan (Seeker)</span>
            </button>
          </div>
        </div>

        {/* Modal Form Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
          {/* INFORMASI BARANG */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="font-title-md text-sm font-semibold text-on-surface dark:text-surface-white">
                Informasi Barang
              </span>
              <span className="text-[12px] text-muted-text flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">public</span>
                Tampil di Feed
              </span>
            </div>

            {/* Judul Barang */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Nama / Judul Barang <span className="text-error-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Dompet Lipat Kulit Cokelat di Selasar Lantai 2"
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-sm input-premium outline-none transition-all"
              />
            </div>

            {/* Kategori Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Kategori Barang <span className="text-error-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                      category === cat.label
                        ? 'border border-primary-container bg-primary-container/10 text-primary-container font-semibold shadow-xs'
                        : 'border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-secondary-ink dark:text-muted-text hover:bg-soft-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi & Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                  Titik Fasilitas Sekolah <span className="text-error-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-text text-[18px]">
                    location_on
                  </span>
                  <select
                    value={facilityLocation}
                    onChange={(e) => setFacilityLocation(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none appearance-none transition-all"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-muted-text text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                  Waktu Kejadian <span className="text-error-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-text text-[18px]">
                    calendar_today
                  </span>
                  <input
                    type="datetime-local"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Catatan Lokasi Detail (Opsional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Detail Lokasi Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="Misal: Dekat loker no. 14, di bangku baris ketiga"
                className="w-full px-4 py-2 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
              />
            </div>

            {/* Deskripsi Publik */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                  Deskripsi Visual Publik
                </label>
                <span className="text-[11px] text-muted-text">Hindari menulis ciri rahasia di sini</span>
              </div>
              <textarea
                rows={3}
                required
                value={publicDescription}
                onChange={(e) => setPublicDescription(e.target.value)}
                placeholder="Deskripsikan bentuk luar, warna dominan, kondisi umum tanpa nomor seri..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none resize-none transition-all"
              />
            </div>

            {/* Foto Barang */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                  Foto Barang <span className="text-error-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-text">Maks 5 MB (JPG, PNG, WebP)</span>
              </div>
              <div className="border border-border-subtle dark:border-dark-border rounded-2xl p-3.5 bg-soft-surface/80 dark:bg-dark-canvas/80 flex flex-col sm:flex-row items-center gap-4 inner-light">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-white border border-border-subtle shrink-0 shadow-xs flex items-center justify-center">
                  <img src={imageUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[17px]">cloud_upload</span>
                      <span>{isUploadingImage ? 'Mengunggah...' : 'Pilih Foto dari Perangkat'}</span>
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-text mb-1.5">Atau gunakan foto referensi cepat:</p>
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setImageUrl(img)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                            imageUrl === img
                              ? 'border-primary-container scale-105 shadow-sm'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ZERO-KNOWLEDGE CIRI RAHASIA */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-primary-container/30 bg-primary-container/[0.03] space-y-4 inner-light">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-container/20 text-on-primary-container">
                    FITUR PENGAMAN
                  </span>
                  <span className="font-title-md text-xs sm:text-sm font-bold text-on-surface dark:text-surface-white">
                    Ciri Khusus Rahasia (Anti-Klaim Palsu)
                  </span>
                </div>
                <p className="text-[11px] text-secondary-ink dark:text-muted-text mt-0.5 leading-relaxed">
                  Hanya Anda yang tahu. Digunakan sistem untuk mencocokkan saat pemilik asli mengajukan klaim.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white flex items-center justify-between">
                <span>
                  Ciri Rahasia / Isi Khusus di Dalam Barang <span className="text-error-destructive">*</span>
                </span>
                <span className="text-[10px] text-secondary font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  SHA-256 Protected
                </span>
              </label>
              <input
                type="text"
                required
                value={secretClue}
                onChange={(e) => setSecretClue(e.target.value)}
                placeholder="Contoh: Jumlah lembar uang, stiker kucing di balik casing, gantungan kunci inisial 'B'"
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Nomor Seri / Ciri Tersembunyi (Opsional)
              </label>
              <input
                type="text"
                value={secretSerial}
                onChange={(e) => setSecretSerial(e.target.value)}
                placeholder="Contoh: IMEI 4 digit terakhir, nomor kartu perpustakaan"
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
              />
            </div>

            {/* Drop at Pos Petugas Toggle */}
            <div className="p-3.5 rounded-xl bg-surface-white dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">
                  admin_panel_settings
                </span>
                <div>
                  <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                    Titipkan Fisik di Pos Satpam / Tata Usaha?
                  </p>
                  <p className="text-[11px] text-muted-text">
                    Sangat disarankan agar barang aman dan bisa diambil kapan saja.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDroppedAtPos}
                  onChange={(e) => setIsDroppedAtPos(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-border-subtle dark:bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border-subtle/70 dark:border-dark-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-muted-text flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
              Terverifikasi Komunitas Sekolah
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border hover:bg-soft-surface text-secondary-ink dark:text-muted-text text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-premium text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Laporan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
