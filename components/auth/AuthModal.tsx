"use client";

import React, { useState, useEffect, useId } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check,
} from "lucide-react";

export function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authModalView, closeAuthModal, openAuthModal, pendingEmail, setPendingEmail } = useAuth();
  const { t, locale } = useI18n();
  const supabase = createClient();
  const termsCheckboxId = useId();

  const getSafeReturnUrl = () => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    return "/app";
  };

  const [email, setEmail] = useState("");
  const [prevPendingEmail, setPrevPendingEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unspecified">("unspecified");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Turnstile state
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (pendingEmail && pendingEmail !== prevPendingEmail) {
    setPrevPendingEmail(pendingEmail);
    setEmail(pendingEmail);
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!authModalView) return null;

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumberOrSymbol].filter(Boolean).length;
  const strengthLabel =
    password.length === 0
      ? ""
      : strengthScore <= 2
      ? t.auth.password_weak
      : strengthScore === 3
      ? t.auth.password_medium
      : t.auth.password_strong;

  const strengthColor =
    strengthScore <= 2
      ? "bg-rose-500 text-rose-600 dark:text-rose-400"
      : strengthScore === 3
      ? "bg-amber-500 text-amber-600 dark:text-amber-400"
      : "bg-emerald-500 text-emerald-600 dark:text-emerald-400";

  // Masked email for OTP display
  const maskedEmail = email
    ? email.replace(/(^.{2})(.*)(@.*$)/, "$1***$3")
    : "email Anda";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        closeAuthModal();
        const destination = getSafeReturnUrl();
        router.push(destination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan autentikasi";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    setOauthLoading(true);
    try {
      const destination = getSafeReturnUrl();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengarahkan ke Google OAuth";
      setErrorMsg(msg);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    if (!termsAgreed) {
      setErrorMsg(t.auth.terms_agree_error);
      return;
    }

    if (password.length < 8) {
      setErrorMsg(t.auth.password_min_error);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            display_name: name.trim(),
            gender: gender,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setPendingEmail(email.trim());
        setCooldown(60);
        setOtpCode("");
        if (data.session) {
          closeAuthModal();
          const destination = getSafeReturnUrl();
          router.push(destination);
        } else {
          openAuthModal("otp");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pendaftaran";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || otpCode.length < 6) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      // Supabase v2 deprecated `signup`/`magiclink` verify types.
      // Using `email` as the single attempt avoids consuming/invalidating the
      // token with a deprecated-type call (which caused "expired/mismatch").
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) {
        setErrorMsg(t.auth.invalid_otp_error);
        return;
      }

      closeAuthModal();
      const destination = getSafeReturnUrl();
      router.push(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memverifikasi kode OTP";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setCooldown(60);
        setOtpCode("");
        setSuccessMsg(t.auth.resend_success);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulang OTP";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/app/settings`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(t.auth.recovery_sent);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 p-2">
            <Image
              src="/logo.svg"
              alt="MuaraKu Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {authModalView === "otp"
              ? t.auth.otp_title
              : authModalView === "forgot"
              ? t.auth.forgot_password
              : t.common.brand}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            {authModalView === "otp"
              ? `${t.auth.otp_desc} (${maskedEmail})`
              : authModalView === "forgot"
              ? t.auth.recovery_email_desc
              : t.common.tagline}
          </p>
        </div>

        {/* Tab Switcher (Login / Register) */}
        {(authModalView === "login" || authModalView === "register") && (
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl mb-6 border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                openAuthModal("login");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                authModalView === "login"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {t.auth.login_tab}
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                openAuthModal("register");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                authModalView === "register"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {t.auth.register_tab}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* OAuth Button for Login & Register with Near-Black Hover Transition */}
        {(authModalView === "login" || authModalView === "register") && (
          <div className="mb-5 space-y-4">
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={loading || oauthLoading}
              className="w-full h-11 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-900 hover:border-zinc-900 hover:text-white dark:hover:bg-zinc-950 dark:hover:border-zinc-950 dark:hover:text-white text-zinc-800 dark:text-zinc-100 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xs transition-colors duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-50 group motion-reduce:transition-none"
            >
              {oauthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="transition-colors group-hover:text-white">
                {authModalView === "login"
                  ? t.auth.google_signin
                  : t.auth.google_signup}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {t.auth.or_with_email}
              </span>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {authModalView === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.email_label}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.email_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.auth.password_label}
                </label>
                <button
                  type="button"
                  onClick={() => openAuthModal("forgot")}
                  className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {t.auth.forgot_password}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.password_placeholder}
                  className="w-full pl-10 pr-11 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.login_button}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalView === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.name_label}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.name_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.email_label}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.email_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.gender_label}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female" | "unspecified")}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="male">{t.auth.gender_male}</option>
                <option value="female">{t.auth.gender_female}</option>
                <option value="unspecified">{t.auth.gender_unspecified}</option>
              </select>
            </div>

            {/* Password Field with Strength Meter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.password_label}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.password_placeholder}
                  className="w-full pl-10 pr-11 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">
                      {t.auth.strength_label}{" "}
                      <strong className={strengthColor.split(" ")[1]}>{strengthLabel}</strong>
                    </span>
                    <span className="text-zinc-400">{password.length} karakter</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 1 ? strengthColor.split(" ")[0] : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 2 ? strengthColor.split(" ")[0] : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 3 ? strengthColor.split(" ")[0] : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 4 ? strengthColor.split(" ")[0] : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500 pt-1">
                    <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600" : ""}`}>
                      <Check className="w-3 h-3" /> Min. 8 karakter
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumberOrSymbol ? "text-emerald-600" : ""}`}>
                      <Check className="w-3 h-3" /> Angka / simbol
                    </span>
                    <span className={`flex items-center gap-1 ${hasUpperCase ? "text-emerald-600" : ""}`}>
                      <Check className="w-3 h-3" /> Huruf kapital (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasLowerCase ? "text-emerald-600" : ""}`}>
                      <Check className="w-3 h-3" /> Huruf kecil (a-z)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cloudflare Turnstile note if configured */}
            {turnstileSiteKey && (
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Perlindungan anti-bot Cloudflare Turnstile aktif.</span>
              </div>
            )}

            {/* Checkbox Legal Consent (Terms & Privacy Links) */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id={termsCheckboxId}
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
              />
              <label
                htmlFor={termsCheckboxId}
                className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer select-none"
              >
                {t.auth.agree_prefix}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                >
                  {t.auth.terms_service_short}
                </a>
                {t.auth.and_conjunction}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                >
                  {t.auth.privacy_policy_short}
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !termsAgreed}
              className="w-full mt-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.register_button}
            </button>
          </form>
        )}

        {/* OTP VERIFICATION VIEW */}
        {authModalView === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                {t.auth.otp_code_label}
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder={t.auth.otp_placeholder}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center tracking-[0.5em] font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.verify_otp_button}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {cooldown > 0 ? (
                <span className="font-medium text-zinc-400">
                  {t.auth.resend_cooldown} {cooldown} {t.auth.seconds}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {t.auth.resend_otp}
                </button>
              )}

              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mt-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.auth.change_email}
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {authModalView === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.auth.email_label}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.email_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.send_recovery_instructions}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.auth.back_to_login}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
