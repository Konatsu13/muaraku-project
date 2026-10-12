'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { register, theme, toggleTheme, isSupabaseConfigured } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Password checks
  const checks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  // Password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (checks.minLength) score++;
    if (checks.hasUpper && checks.hasLower) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;

    if (score <= 1) {
      return { score: 1, label: 'Lemah', color: 'bg-error-destructive' };
    }
    if (score === 2) {
      return { score: 2, label: 'Sedang', color: 'bg-amber-500' };
    }
    if (score === 3) {
      return { score: 3, label: 'Bagus', color: 'bg-tertiary-container' };
    }
    return { score: 4, label: 'Sangat Kuat', color: 'bg-secondary' };
  }, [checks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Harap isi nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Harap isi alamat email aktif.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Kata sandi harus minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Ketentuan Layanan & Privasi.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        setIsSuccess(true);
        setEmailConfirmationRequired(Boolean(result.emailConfirmation));
      } else {
        setErrorMessage(result.error || 'Pendaftaran tidak berhasil.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-canvas dark:bg-dark-canvas text-on-surface dark:text-surface-white relative overflow-x-hidden flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-950">
      {/* Ambient Lighting & Texture Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-dot-pattern opacity-[0.35] dark:opacity-[0.22]" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.15),transparent_70%)]" aria-hidden="true" />
      <div className="fixed -top-40 right-[-100px] w-[500px] h-[500px] pointer-events-none z-0 rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-3xl" aria-hidden="true" />
      <div className="fixed bottom-0 left-[-150px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-amber-400/10 dark:bg-amber-600/08 blur-3xl" aria-hidden="true" />

      {/* Top Floating Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          onClick={() => onNavigate('login')}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 flex items-center justify-center p-1.5 shadow-sm shadow-orange-500/15 ring-1 ring-white/50 dark:ring-white/10 group-hover:scale-105 transition-all">
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
            <span>Kembali ke Halaman Masuk</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission & Trust Banner */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold shadow-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Pendaftaran Akun Warga Terverifikasi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface-white leading-[1.15]">
                Bergabung dengan Jaringan{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                  Integritas Sipil
                </span>{' '}
                Sekolah.
              </h1>

              <p className="text-sm sm:text-base text-muted-text dark:text-zinc-400 leading-relaxed">
                Setiap laporan kehilangan dan temuan di MuaraKu dilindungi sistem reputasi Civic Karma dan verifikasi petugas pos terdekat.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3.5 max-w-md pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Reputasi Civic Karma Awal (100 Poin)</strong>
                  <p className="text-muted-text dark:text-zinc-400 text-[11px] mt-0.5">Dapatkan skor kepercayaan otomatis untuk memverifikasi klaim barang Anda secara instan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Notifikasi Cepat Kecocokan AI</strong>
                  <p className="text-muted-text dark:text-zinc-400 text-[11px] mt-0.5">Sistem cerdas kami langsung memberitahu jika ciri barang yang hilang terdaftar di database penemuan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </div>
                <div className="text-xs">
                  <strong className="text-on-surface dark:text-surface-white font-semibold">Akses Ruang Obrolan & Pos Satpam</strong>
                  <p className="text-muted-text dark:text-zinc-400 text-[11px] mt-0.5">Kirim pesan privat terenkripsi langsung ke penemu atau verifikator satpam gedung utama.</p>
                </div>
              </div>
            </div>

            {/* Privacy Box */}
            <div className="p-4 rounded-2xl bg-warm-canvas/80 dark:bg-dark-surface/60 border border-border-subtle/80 dark:border-white/10 text-xs text-muted-text dark:text-zinc-400 flex items-start gap-3 inner-light shadow-xs max-w-lg">
              <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">
                privacy_tip
              </span>
              <p className="text-[11px] leading-relaxed">
                Kami menghargai privasi siswa dan staf sekolah. Data kontak Anda tidak akan pernah dipublikasikan secara terbuka atau dibagikan ke pihak ketiga tanpa izin.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Konfigurasi Supabase Diperlukan</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Harap lengkapi file <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.env</code> dengan kredensial Supabase Anda sebelum melakukan pendaftaran.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Register Form Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-full max-w-lg glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.4)] p-6 sm:p-8 inner-light">
              {/* Success View */}
              {isSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary mx-auto flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-on-surface dark:text-surface-white">
                      {emailConfirmationRequired ? 'Konfirmasi Email Terkirim!' : 'Pendaftaran Berhasil!'}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-text dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      {emailConfirmationRequired
                        ? `Kami telah mengirimkan tautan konfirmasi ke ${email}. Silakan buka kotak masuk Anda untuk mengaktifkan akun.`
                        : `Selamat datang di MuaraKu! Akun Anda siap digunakan untuk pelaporan dan pencarian barang.`}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => onNavigate('login')}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-semibold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Masuk ke Akun Anda</span>
                    </button>
                    <button
                      onClick={() => onNavigate('discover')}
                      className="py-3 px-6 rounded-xl glass-surface border border-border-subtle dark:border-white/10 text-on-surface dark:text-surface-white font-semibold text-sm hover:border-primary-container/40 transition-all"
                    >
                      Jelajahi Beranda
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5 mb-5">
                    <h2 className="text-2xl font-bold tracking-tight text-on-surface dark:text-surface-white">
                      Buat Akun Warga
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-text dark:text-zinc-400">
                      Lengkapi identitas untuk mendapatkan akses penuh di MuaraKu.
                    </p>
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-error-destructive/10 border border-error-destructive/20 text-error-destructive text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                        error
                      </span>
                      <div className="leading-relaxed">
                        <strong>Perhatian: </strong>
                        {errorMessage}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Full Name */}
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
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Contoh: Andi Hartono"
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                        Alamat Email
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@sekolah.id atau email@gmail.com"
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                        Kata Sandi
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                          lock
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white p-1"
                          aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>

                      {/* Password strength meter */}
                      {password && (
                        <div className="pt-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-text dark:text-zinc-400">Kekuatan:</span>
                            <span className="font-semibold">{strength.label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 h-1.5">
                            <div className={`h-full rounded-full ${strength.color}`} />
                            <div className={`h-full rounded-full ${strength.score >= 2 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                            <div className={`h-full rounded-full ${strength.score >= 3 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                            <div className={`h-full rounded-full ${strength.score >= 4 ? strength.color : 'bg-black/10 dark:bg-white/10'}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
                        Konfirmasi Kata Sandi
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-[20px]">
                          lock_reset
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-surface-white dark:bg-dark-canvas text-on-surface dark:text-surface-white text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-muted-text/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-on-surface dark:hover:text-surface-white p-1"
                          aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border-subtle/60 dark:border-white/5 space-y-1.5 text-[11px]">
                      <span className="font-semibold text-muted-text dark:text-zinc-400 block">Kriteria Kata Sandi:</span>
                      <div className="grid grid-cols-2 gap-1 text-muted-text dark:text-zinc-400">
                        <div className={`flex items-center gap-1.5 ${checks.minLength ? 'text-secondary font-medium' : ''}`}>
                          <span className="material-symbols-outlined text-[14px]">{checks.minLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Minimal 8 Karakter</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${checks.hasUpper && checks.hasLower ? 'text-secondary font-medium' : ''}`}>
                          <span className="material-symbols-outlined text-[14px]">{checks.hasUpper && checks.hasLower ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Huruf Besar & Kecil</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-secondary font-medium' : ''}`}>
                          <span className="material-symbols-outlined text-[14px]">{checks.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Minimal 1 Angka</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${checks.hasSpecial ? 'text-secondary font-medium' : ''}`}>
                          <span className="material-symbols-outlined text-[14px]">{checks.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Karakter Khusus (!@#$)</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          required
                          className="mt-0.5 w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container accent-orange-500"
                        />
                        <span className="text-muted-text dark:text-zinc-400 text-[11px] leading-relaxed">
                          Saya menyetujui Ketentuan Layanan, Kebijakan Privasi Sipil MuaraKu 2026, serta bersedia menjaga kejujuran informasi kepemilikan barang.
                        </span>
                      </label>
                    </div>

                    {/* Create Account Button */}
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
                          <span>Membuat Akun Warga...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">person_add</span>
                          <span>Daftar Akun Sekarang</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch to Login */}
                  <div className="text-center pt-5 mt-5 border-t border-border-subtle/70 dark:border-white/10">
                    <p className="text-xs text-muted-text dark:text-zinc-400">
                      Sudah memiliki akun warga?{' '}
                      <button
                        onClick={() => onNavigate('login')}
                        className="text-primary-container font-semibold hover:underline transition-colors"
                      >
                        Masuk di Sini
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-muted-text dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 MuaraKu Sipil. Platform Lost & Found Sekolah & Komunitas Terpadu.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={() => onNavigate('support')} className="hover:underline">Bantuan & Panduan</button>
          <span>•</span>
          <button onClick={() => onNavigate('landing')} className="hover:underline">Tentang Sistem</button>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;
