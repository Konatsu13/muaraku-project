'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onOpenReportModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onOpenReportModal }) => {
  const { login, targetRedirect, setTargetRedirect, theme, toggleTheme, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email Anda.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Format alamat email tidak valid (contoh: nama@sekolah.id).');
      return;
    }

    if (!password) {
      setErrorMessage('Harap masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (targetRedirect === 'report') {
          setTargetRedirect(null);
          onNavigate('discover');
          onOpenReportModal?.();
        } else if (targetRedirect) {
          const dest = targetRedirect;
          setTargetRedirect(null);
          onNavigate(dest);
        } else {
          onNavigate('discover');
        }
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-on-surface dark:text-surface-white relative overflow-x-hidden flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-950">
      {/* Top Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 flex items-center justify-center p-1.5 shadow-sm shadow-orange-500/15 ring-1 ring-white/50 dark:ring-white/10">
            <img src="/logo.svg" alt="MuaraKu" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-headline-md text-base sm:text-lg font-bold tracking-tight text-on-surface dark:text-surface-white">
              MuaraKu
            </span>
            <span className="block text-[10px] font-semibold text-primary-container -mt-1">
              Lost & Found Sekolah
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-muted-text hover:text-on-surface dark:hover:text-surface-white flex items-center justify-center transition-all hover:scale-105"
            title="Ganti Tema"
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-primary-container hover:text-orange-600 dark:hover:text-orange-400 glass-surface border border-primary-container/30 hover:border-primary-container/60 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Daftar Akun</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand & Security Value Proposition */}
          <div className="lg:col-span-6 space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-surface border border-primary-container/30 text-xs font-semibold text-on-surface dark:text-surface-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Autentikasi Aman & Wajib Masuk</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-headline-lg text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface-white leading-[1.12]">
                Masuk untuk Mengakses Layanan{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                  Lost & Found
                </span>
              </h1>
              <p className="font-body-lg text-sm sm:text-base text-secondary-ink dark:text-muted-text max-w-lg leading-relaxed">
                Platform terpadu civitas sekolah untuk pelaporan barang hilang, pengamanan barang temuan, dan verifikasi klaim kepemilikan terenkripsi.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2 max-w-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Zero-Knowledge Verification</strong>
                  <p className="text-muted-text text-[11px] mt-0.5">Ciri rahasia barang dienkripsi sehingga hanya pemilik asli yang dapat mengajukan klaim.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">shield</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Keamanan Terintegrasi Supabase Auth</strong>
                  <p className="text-muted-text text-[11px] mt-0.5">Setiap aktivitas dan laporan tersimpan aman dengan session manajemen berbasis token JWT.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">location_city</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Jaringan 4 Pos Keamanan Sekolah</strong>
                  <p className="text-muted-text text-[11px] mt-0.5">Barang temuan dapat langsung dititipkan di gerbang utama, perpustakaan, atau ruang TU.</p>
                </div>
              </div>
            </div>

            {/* Supabase Configuration Warning Banner if .env is missing */}
            {!isSupabaseConfigured && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Konfigurasi Supabase Diperlukan</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Buat file <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.env</code> pada direktori utama proyek dengan variabel <code className="font-mono">VITE_SUPABASE_URL</code> dan <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> untuk mengaktifkan koneksi database & autentikasi penuh.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Modern Glass Login Form */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end animate-fade-in-up delay-100">
            <div className="w-full max-w-lg glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)] p-6 sm:p-8 inner-light">
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface dark:text-surface-white">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text">
                  Gunakan email dan kata sandi akun terdaftar untuk melanjutkan ke dashboard.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-error-destructive/10 border border-error-destructive/20 text-error-destructive text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <div className="leading-relaxed">
                    <strong>Perhatian: </strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Email Pengguna
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@sekolah.id atau email Anda"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-xs sm:text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot-password')}
                      className="text-[11px] text-primary-container hover:underline font-semibold"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi Anda"
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-xs sm:text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white transition-colors p-1"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-secondary-ink dark:text-muted-text">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container/20 accent-orange-500"
                    />
                    <span>Ingat sesi masuk di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:brightness-110 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Masuk ke Dashboard</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-6 mt-6 border-t border-border-subtle/70 dark:border-white/10">
                <p className="text-xs text-muted-text">
                  Belum memiliki akun?{' '}
                  <button
                    onClick={() => onNavigate('signup')}
                    className="font-bold text-primary-container hover:underline ml-1"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-muted-text flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-subtle/40 dark:border-white/5">
        <p>© 2026 MuaraKu Sipil. Sistem Temu Kembali Terverifikasi Sekolah.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Autentikasi Terenkripsi Supabase Auth</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
