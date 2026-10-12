'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { activeAuthModal, closeAuthModal, openAuthModal, login, register, resetPassword } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);

  // Password strength calculation for registration
  const strength = useMemo(() => {
    let score = 0;
    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score++;
    if (/[0-9]/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-error-destructive' };
    if (score === 2) return { score: 2, label: 'Sedang', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Bagus', color: 'bg-tertiary-container' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-secondary' };
  }, [regPassword]);

  if (!activeAuthModal) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessInfo(null);
  };

  const handleSwitchView = (view: 'login' | 'register' | 'forgot-password') => {
    resetFormState();
    openAuthModal(view);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Harap masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Email atau kata sandi tidak valid.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Harap isi nama lengkap dan email Anda.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Kata sandi harus memiliki minimal 8 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Ketentuan Sipil & Kebijakan Privasi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword);
      if (res.success) {
        if (res.emailConfirmation) {
          setSuccessInfo({
            title: 'Konfirmasi Email Terkirim',
            message: `Tautan aktivasi telah dikirimkan ke ${regEmail}. Silakan periksa kotak masuk email Anda sebelum masuk.`,
          });
        }
      } else {
        setErrorMessage(res.error || 'Pendaftaran tidak dapat diselesaikan.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetEmail.trim()) {
      setErrorMessage('Harap masukkan alamat email akun Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(resetEmail);
      if (res.success) {
        setSuccessInfo({
          title: 'Tautan Reset Terkirim',
          message: `Instruksi pemulihan kata sandi telah dikirim ke ${resetEmail}. Buka email Anda untuk mengatur sandi baru.`,
        });
      } else {
        setErrorMessage(res.error || 'Gagal mengirim instruksi pemulihan.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-surface w-full max-w-lg rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] inner-light">
        {/* Header with Brand & Close */}
        <div className="p-4 sm:p-5 border-b border-border-subtle/70 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-container to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-container/20">
              M
            </div>
            <span className="font-headline-sm text-base font-bold text-on-surface dark:text-surface-white">
              MuaraKu Sipil
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-text hover:text-on-surface dark:hover:text-surface-white flex items-center justify-center transition-colors border border-transparent hover:border-border-subtle"
            aria-label="Tutup Dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Error Message Display */}
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

          {/* Success Banner */}
          {successInfo && (
            <div className="mb-5 p-4 rounded-2xl bg-secondary/15 border border-secondary/25 text-on-surface dark:text-surface-white text-xs space-y-2 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 text-secondary font-bold">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{successInfo.title}</span>
              </div>
              <p className="text-secondary-ink dark:text-zinc-300 leading-relaxed text-[11px]">
                {successInfo.message}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-white font-semibold text-[11px] hover:brightness-110 transition-all inline-flex items-center gap-1"
                >
                  <span>Kembali ke Halaman Masuk</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= VIEW 1: LOGIN ================= */}
          {activeAuthModal === 'login' && !successInfo && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container/10 text-primary-container mb-1 shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">shield_person</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white tracking-tight">
                  Masuk ke Komunitas MuaraKu
                </h2>
                <p className="font-body-md text-xs sm:text-sm text-secondary-ink dark:text-muted-text">
                  Titik Temu Aman & Terpercaya untuk penemuan kembali hak dan kepemilikan warga sekolah.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Email Warga
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="nama@sekolah.id"
                      autoComplete="email"
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
                      onClick={() => handleSwitchView('forgot-password')}
                      className="text-xs text-primary-container hover:underline font-medium"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      lock
                    </span>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="Masukkan kata sandi terdaftar"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white p-1"
                      aria-label={showLoginPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container accent-orange-500"
                    />
                    <span className="text-secondary-ink dark:text-muted-text">Ingat sesi perangkat ini</span>
                  </label>
                  <span className="text-muted-text flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                    Sertifikat SSL Aktif
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-amber-600 hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Memproses Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      <span>Masuk ke MuaraKu</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-border-subtle dark:border-dark-border space-y-3">
                <p className="text-xs text-secondary-ink dark:text-muted-text">
                  Belum punya akun?{' '}
                  <button
                    onClick={() => handleSwitchView('register')}
                    className="text-primary-container font-semibold hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </p>

                <div className="p-3.5 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border text-left flex items-start gap-2.5 inner-light">
                  <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
                    lock_clock
                  </span>
                  <p className="text-[11px] text-secondary-ink dark:text-muted-text leading-relaxed">
                    <strong className="text-on-surface dark:text-surface-white">Jaminan Perlindungan Data:</strong> Data Anda dilindungi enkripsi standar dan tidak akan dibagikan ke pihak ketiga atau diperjualbelikan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: REGISTER ================= */}
          {activeAuthModal === 'register' && !successInfo && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-primary-container/10 text-primary-container text-[11px] font-semibold inline-block">
                  Identitas Warga Sekolah
                </span>
                <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white tracking-tight">
                  Pendaftaran Akun MuaraKu
                </h2>
                <p className="font-body-md text-xs text-secondary-ink dark:text-muted-text">
                  Buat akun resmi untuk memudahkan klaim barang dan pelaporan temuan publik.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      badge
                    </span>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="Contoh: Andi Hartono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Email Aktif
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      lock_reset
                    </span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white p-1"
                      aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {regPassword && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-secondary-ink dark:text-muted-text">Kekuatan Sandi:</span>
                        <span className="font-semibold">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`h-full rounded-full ${strength.color}`} />
                        <div className={`h-full rounded-full ${strength.score >= 2 ? strength.color : 'bg-soft-surface dark:bg-dark-border'}`} />
                        <div className={`h-full rounded-full ${strength.score >= 3 ? strength.color : 'bg-soft-surface dark:bg-dark-border'}`} />
                        <div className={`h-full rounded-full ${strength.score >= 4 ? strength.color : 'bg-soft-surface dark:bg-dark-border'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                      lock
                    </span>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="Ulangi kata sandi"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white p-1"
                      aria-label={showRegConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-border-subtle dark:border-dark-border bg-soft-surface dark:bg-dark-canvas inner-light">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="mt-0.5 w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container accent-orange-500"
                    />
                    <span className="text-secondary-ink dark:text-muted-text leading-relaxed text-[11px]">
                      Saya menyetujui Ketentuan Sipil & Kebijakan Privasi MuaraKu 2026. Saya bersedia menjaga integritas bukti kepemilikan.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-amber-600 hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Warga</span>
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-border-subtle dark:border-dark-border">
                <span className="text-xs text-secondary-ink dark:text-muted-text">Sudah memiliki akun warga? </span>
                <button
                  onClick={() => handleSwitchView('login')}
                  className="text-xs text-primary-container font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: FORGOT PASSWORD ================= */}
          {activeAuthModal === 'forgot-password' && !successInfo && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container/10 text-primary-container mb-1 shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white tracking-tight">
                  Atur Ulang Kata Sandi
                </h2>
                <p className="font-body-md text-xs sm:text-sm text-secondary-ink dark:text-muted-text">
                  Ketik email akun warga Anda untuk mendapatkan tautan pemulihan kata sandi yang aman.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
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
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                      placeholder="nama@sekolah.id"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-amber-600 hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
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
                      <span>Kirim Tautan Pemulihan</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-border-subtle dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="text-xs text-primary-container font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                  <span>Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
