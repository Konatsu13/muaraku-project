'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword, theme, toggleTheme } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email akun Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(result.error || 'Gagal mengirim instruksi pemulihan.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-canvas dark:bg-dark-canvas text-on-surface dark:text-surface-white relative overflow-x-hidden flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-950">
      {/* Ambient Lighting & Texture Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-dot-pattern opacity-[0.35] dark:opacity-[0.22]" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.15),transparent_70%)]" aria-hidden="true" />
      <div className="fixed -top-40 right-[-100px] w-[500px] h-[500px] pointer-events-none z-0 rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-3xl" aria-hidden="true" />
      <div className="fixed bottom-0 left-[-150px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-amber-400/10 dark:bg-amber-600/08 blur-3xl" aria-hidden="true" />

      {/* Top Floating Bar */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          onClick={() => onNavigate('login')}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 ring-2 ring-white/50 dark:ring-white/10 group-hover:scale-105 transition-all">
            <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 19C5.34315 19 4 20.3431 4 22C4 23.6569 5.34315 25 7 25C8.65685 25 10 23.6569 10 22L12.5 13.5L16 20.5L19.5 13.5L22 22C22 23.6569 23.3431 25 25 25C26.6569 25 28 23.6569 28 22C28 20.3431 26.6569 19 25 19"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="7.5" r="3" stroke="white" strokeWidth="2.5" />
              <path
                d="M13.5 13C14.2 11.8 15 11 16 11C17 11 17.8 11.8 18.5 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <span className="font-headline-md text-base sm:text-lg font-bold tracking-tight text-on-surface dark:text-surface-white">
              MuaraKu
            </span>
            <span className="block text-[10px] font-semibold text-primary-container -mt-1">
              Lost & Found Sekolah
            </span>
          </div>
        </button>

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
            onClick={() => onNavigate('login')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-text hover:text-on-surface dark:hover:text-surface-white glass-surface border border-border-subtle/80 dark:border-white/10 hover:border-primary-container/40 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Kembali ke Masuk</span>
          </button>
        </div>
      </header>

      {/* Main Centered Card Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-8 flex-1 flex items-center justify-center">
        <div className="w-full glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.4)] p-6 sm:p-8 inner-light animate-in fade-in zoom-in-95 duration-500">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary mx-auto flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface dark:text-surface-white">
                  Periksa Email Anda
                </h2>
                <p className="text-xs sm:text-sm text-muted-text dark:text-zinc-400 leading-relaxed">
                  Tautan pemulihan kata sandi telah dikirimkan ke <strong className="text-on-surface dark:text-surface-white font-medium">{email}</strong> jika alamat tersebut terdaftar dalam sistem.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-left text-muted-text dark:text-zinc-400 space-y-1">
                <strong className="text-on-surface dark:text-surface-white font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-container">info</span>
                  Catatan Keamanan:
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Periksa juga folder Spam atau Promosi jika email tidak muncul dalam 2 menit. Tautan kedaluwarsa dalam 1 jam.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-semibold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-primary-container mx-auto flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface dark:text-surface-white">
                  Lupa Kata Sandi?
                </h2>
                <p className="text-xs sm:text-sm text-muted-text dark:text-zinc-400 leading-relaxed">
                  Masukkan email yang terdaftar untuk menerima tautan atur ulang kata sandi yang aman.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-error-destructive/10 border border-error-destructive/20 text-error-destructive text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="leading-relaxed">
                    <strong>Gagal: </strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Email Terdaftar
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
                      placeholder="nama@sekolah.id"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Kirim Tautan Atur Ulang</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-5 mt-5 border-t border-border-subtle/70 dark:border-white/10 space-y-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs text-primary-container font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-muted-text dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 MuaraKu Sipil. Titik Temu Aman & Terpercaya.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={() => onNavigate('support')} className="hover:underline">Pusat Bantuan</button>
          <span>•</span>
          <button onClick={() => onNavigate('login')} className="hover:underline">Halaman Masuk</button>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
