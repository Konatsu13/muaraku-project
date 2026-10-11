import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../lib/supabase';
import { ModerationReport } from '../../types';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'report' | 'user' | 'message';
  targetId: string;
  targetTitle?: string;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState<ModerationReport['reason']>('spam');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await db.submitModerationReport({
        reporter_id: currentUser?.id || 'usr-current',
        reporter_name: currentUser?.name || 'Warga Pelapor',
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        reason,
        notes,
      });

      showToast('Laporan moderasi berhasil dikirim ke pengawas sekolah/admin.', 'success');
      onClose();
    } catch {
      showToast('Gagal mengirim laporan moderasi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-surface w-full max-w-md rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] p-6 space-y-4 inner-light">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle/70 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-error-destructive/15 text-error-destructive flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">flag</span>
            </div>
            <div>
              <h3 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white">
                Laporkan {targetType === 'report' ? 'Postingan' : targetType === 'message' ? 'Pesan' : 'Pengguna'}
              </h3>
              <p className="text-[11px] text-muted-text">Audit Pengawasan Etika Komunitas Sipil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-soft-surface text-muted-text hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {targetTitle && (
          <div className="p-3 rounded-2xl bg-soft-surface/70 dark:bg-dark-canvas/70 border border-border-subtle dark:border-dark-border text-xs text-secondary-ink dark:text-muted-text truncate font-medium">
            Sasaran: <strong className="text-on-surface dark:text-surface-white">{targetTitle}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
              Alasan Pelaporan
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all"
            >
              <option value="spam">Spam / Pesan Berulang</option>
              <option value="scam">Dugaan Penipuan / Pemerasan Tebusan</option>
              <option value="harassment">Pelecehan / Kata-kata Tidak Pantas</option>
              <option value="false_info">Informasi Palsu / Menyesatkan</option>
              <option value="privacy_exposure">Membuka Identitas Pribadi (Doxxing)</option>
              <option value="other">Alasan Lainnya</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
              Penjelasan Tambahan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Berikan detail bukti atau keterangan bagi pengawas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-xs focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none resize-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/70 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-subtle dark:border-dark-border text-xs text-secondary-ink font-semibold hover:bg-soft-surface transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-error-destructive hover:brightness-110 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-error-destructive/20 disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">report</span>
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
