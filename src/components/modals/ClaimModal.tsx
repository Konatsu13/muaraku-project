import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../lib/supabase';
import { Report } from '../../types';

interface ClaimModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted?: () => void;
  onOpenChatWithFinder?: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  report,
  isOpen,
  onClose,
  onClaimSubmitted,
  onOpenChatWithFinder,
}) => {
  const { currentUser, isAuthenticated, openAuthModal, setTargetRedirect } = useAuth();
  const { showToast } = useToast();

  const [proofDescription, setProofDescription] = useState('');
  const [proofSerial, setProofSerial] = useState('');
  const [meetingLocation, setMeetingLocation] = useState(
    'Pos Keamanan / Satpam Gedung Utama'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  // Enforce authentication check: if user is not authenticated, prompt login
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="glass-surface w-full max-w-md rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-2xl p-6 text-center space-y-4 inner-light card-premium">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-title-md text-lg font-bold text-on-surface dark:text-surface-white">
              Masuk untuk Mengajukan Klaim
            </h3>
            <p className="text-xs text-secondary-ink dark:text-muted-text">
              Untuk membuktikan kepemilikan dan memvalidasi identitas pengambil barang, Anda harus masuk ke akun MuaraKu terlebih dahulu.
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
                setTargetRedirect?.('discover');
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
    if (!proofDescription.trim()) {
      showToast('Harap jelaskan bukti atau ciri rahasia kepemilikan barang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitClaim({
        report_id: report.id,
        report_title: report.title,
        claimant_id: currentUser.id,
        claimant_name: currentUser.name,
        claimant_avatar: currentUser.avatar_url,
        proof_description: proofDescription,
        proof_serial: proofSerial,
        meeting_location: meetingLocation,
      });

      showToast(
        `Klaim diajukan! Bukti Anda akan dicocokkan dengan penemu/pos satpam.`,
        'success'
      );
      if (onClaimSubmitted) onClaimSubmitted();
      if (onOpenChatWithFinder) onOpenChatWithFinder();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Gagal mengajukan klaim. Silakan coba kembali.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-surface w-full max-w-xl rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[92vh] overflow-hidden inner-light card-premium">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-subtle/70 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-md text-base sm:text-lg font-bold text-on-surface dark:text-surface-white tracking-tight">
                  Ajukan Klaim Barang
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-soft-surface dark:bg-dark-canvas border border-border-subtle dark:border-dark-border text-secondary-ink dark:text-muted-text">
                  {report.report_code}
                </span>
              </div>
              <p className="text-secondary-ink dark:text-muted-text text-xs mt-0.5">
                Buktikan kepemilikan Anda secara aman dan terverifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border-subtle dark:border-dark-border hover:bg-soft-surface dark:hover:bg-dark-canvas text-muted-text hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-5">
          {/* Item Card Summary */}
          <div className="p-4 rounded-2xl border border-border-subtle/80 dark:border-dark-border bg-soft-surface/60 dark:bg-dark-canvas/60 backdrop-blur-xs flex items-start sm:items-center gap-3.5 inner-light">
            <div className="w-16 h-16 rounded-xl bg-surface-white dark:bg-dark-surface overflow-hidden shrink-0 border border-border-subtle dark:border-dark-border shadow-xs">
              <img src={report.image_url} alt={report.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container/15 text-on-primary-container inline-block">
                {report.category}
              </span>
              <p className="text-sm font-semibold text-on-surface dark:text-surface-white truncate mt-1">
                {report.title}
              </p>
              <p className="text-xs text-muted-text flex items-center gap-1 mt-0.5 truncate">
                <span className="material-symbols-outlined text-[15px] text-tertiary-container">
                  location_on
                </span>
                <span>{report.facility_location}</span>
              </p>
            </div>
          </div>

          {/* Claimant Identity (From Authenticated User) */}
          <div className="p-3.5 rounded-2xl bg-primary-container/[0.05] border border-primary-container/20 flex items-center justify-between inner-light">
            <div className="flex items-center gap-3">
              <img
                src={
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                }
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-primary-container/30"
              />
              <div>
                <p className="text-xs font-bold text-on-surface dark:text-surface-white">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-muted-text">{currentUser.email}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-primary-container/20 text-primary-container">
              Akun Terverifikasi
            </span>
          </div>

          {/* Verification questionnaire */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white flex items-center justify-between">
                <span>
                  Bukti Ciri Rahasia / Isi di Dalam Barang <span className="text-error-destructive">*</span>
                </span>
                <span className="text-[10px] text-secondary font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">security</span>
                  Hanya Diketahui Pemilik
                </span>
              </label>
              <textarea
                rows={3}
                required
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                placeholder="Contoh: Di dalam ada kartu pelajar atas nama saya, uang 2 lembar 50rb, dan gantungan kunci inisial 'AH'..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none resize-none transition-all"
              />
              <p className="text-[11px] text-muted-text">
                Petugas pos satpam atau penemu akan mencocokkan ciri rahasia ini sebelum menyerahkan barang fisik.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Nomor Identitas / Serial Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={proofSerial}
                onChange={(e) => setProofSerial(e.target.value)}
                placeholder="Misal: Nomor Induk Siswa (NIS), 4 digit belakang KTP"
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                Titik Serah Terima Aman di Sekolah
              </label>
              <select
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs input-premium outline-none transition-all"
              >
                <option>Pos Keamanan / Satpam Gedung Utama</option>
                <option>Ruang Bimbingan Konseling / Tata Usaha Sekolah</option>
                <option>Meja Sirkulasi Perpustakaan Pusat</option>
                <option>Pos Jaga Satpam Pintu Belakang</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-border-subtle/80 dark:border-dark-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-muted-text flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
              Bebas Biaya Tebusan & Pungutan
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Bukti Klaim'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
