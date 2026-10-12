'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useAuth();
  const { showToast } = useToast();

  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifMatch, setNotifMatch] = useState(true);
  const [maskPhone, setMaskPhone] = useState(true);

  const handleSave = () => {
    showToast('Preferensi pengaturan berhasil disimpan.', 'success');
  };

  return (
    <main className="flex-1 px-4 sm:px-8 py-7 max-w-[960px] w-full mx-auto space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="card-premium p-6 sm:p-8 rounded-3xl border border-border-subtle/80 dark:border-white/10 inner-light">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </div>
          <div>
            <h1 className="font-headline-md text-xl sm:text-2xl font-extrabold text-on-surface dark:text-surface-white tracking-tight">
              Pengaturan Sistem & Privasi
            </h1>
            <p className="text-xs text-secondary-ink dark:text-muted-text mt-0.5">
              Kelola preferensi antarmuka, bahasa, proteksi data UU PDP 2022, dan notifikasi pencocokan AI.
            </p>
          </div>
        </div>
      </div>

      {/* Theme & Display */}
      <section className="card-premium p-6 sm:p-7 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 inner-light">
        <h2 className="font-title-md text-sm font-bold text-on-surface dark:text-surface-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary-container">palette</span>
          <span>Tampilan & Bahasa</span>
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border">
          <div>
            <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
              Tema Antarmuka (Light / Dark Mode)
            </p>
            <p className="text-[11px] text-muted-text mt-0.5">
              Tema saat ini: <strong className="text-primary-container font-semibold">{theme === 'dark' ? 'Dark Mode (Zinc & Obsidian)' : 'Light Mode (Warm Canvas & Amber Glow)'}</strong>
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl glass-surface border border-border-subtle dark:border-dark-border text-xs font-semibold hover:border-primary-container/40 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>Ganti Tema</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border">
          <div>
            <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
              Bahasa Antarmuka (Language)
            </p>
            <p className="text-[11px] text-muted-text mt-0.5">Bahasa sistem dan istilah penemuan barang</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-surface text-xs font-medium focus:border-primary-container outline-none"
          >
            <option value="id">Bahasa Indonesia (Resmi)</option>
            <option value="en">English (US)</option>
          </select>
        </div>
      </section>

      {/* Privacy & Safety */}
      <section className="card-premium p-6 sm:p-7 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 inner-light">
        <h2 className="font-title-md text-sm font-bold text-on-surface dark:text-surface-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">security</span>
          <span>Privasi & Perlindungan Data Sipil</span>
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border cursor-pointer hover:border-primary-container/40 transition-colors">
            <div>
              <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                Sensor / Masking Nomor WhatsApp & Kontak Pribadi
              </p>
              <p className="text-[11px] text-muted-text mt-0.5">
                Nomor kontak hanya dapat diakses setelah bukti klaim terverifikasi oleh petugas pos satpam.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maskPhone}
              onChange={(e) => setMaskPhone(e.target.checked)}
              className="w-4 h-4 rounded text-primary-container focus:ring-primary-container"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border cursor-pointer hover:border-primary-container/40 transition-colors">
            <div>
              <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                Notifikasi Proaktif Radar AI Matching
              </p>
              <p className="text-[11px] text-muted-text mt-0.5">
                Sistem secara otomatis mengirim pemberitahuan saat ada temuan dengan skor kecocokan &gt; 90%.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifMatch}
              onChange={(e) => setNotifMatch(e.target.checked)}
              className="w-4 h-4 rounded text-primary-container focus:ring-primary-container"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border cursor-pointer hover:border-primary-container/40 transition-colors">
            <div>
              <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                Laporan Berkala Mingguan Posko
              </p>
              <p className="text-[11px] text-muted-text mt-0.5">
                Kirimkan rangkuman mingguan mengenai barang temuan yang belum diambil di lingkungan sekolah.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="w-4 h-4 rounded text-primary-container focus:ring-primary-container"
            />
          </label>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            onClick={handleSave}
            className="btn-premium px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            Simpan Preferensi
          </button>
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;
