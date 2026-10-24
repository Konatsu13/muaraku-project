"use client";

import React, { useState, useEffect, useId } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
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
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Turnstile token state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileTokenView, setTurnstileTokenView] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const authModalFromUrl = searchParams.get("auth") === "login";
  const activeAuthModalView = authModalView ?? (authModalFromUrl ? "login" : null);
  const activeTurnstileToken =
    turnstileTokenView === activeAuthModalView ? turnstileToken : null;
  const displayedError = errorMsg ?? (authModalFromUrl ? searchParams.get("error") : null);

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

  if (!activeAuthModalView) return null;

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

  const hasTurnstileToken = (): boolean => {
    if (!turnstileSiteKey || turnstileSiteKey.includes("your_turnstile")) {
      return true;
    }
    if (!activeTurnstileToken) {
      setErrorMsg("Harap selesaikan verifikasi keamanan (Turnstile) terlebih dahulu.");
      return false;
    }
    return true;
  };

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileTokenView(null);
    setTurnstileResetKey((key) => key + 1);
  };

  const handleCloseAuthModal = () => {
    closeAuthModal();
    if (authModalFromUrl) {
      router.replace("/", { scroll: false });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    if (!hasTurnstileToken()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: {
          captchaToken: activeTurnstileToken || undefined,
        },
      });

      if (error) {
        // Extract rate limit feedback from Supabase error if 429
        if (error.status === 429) {
          const match = error.message.match(/(\d+)\s*seconds?/i);
          if (match && match[1]) {
            setCooldown(parseInt(match[1], 10));
          }
          setErrorMsg("Terlalu banyak percobaan. Harap tunggu sebelum mencoba lagi.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        closeAuthModal();
        const destination = getSafeReturnUrl();
        router.replace(destination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan autentikasi";
      setErrorMsg(msg);
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    if (!hasTurnstileToken()) return;
    setOauthLoading(true);
    try {
      const destination = getSafeReturnUrl();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          captchaToken: activeTurnstileToken || undefined,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengarahkan ke Google OAuth";
      setErrorMsg(msg);
    } finally {
      resetTurnstile();
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

    if (!hasTurnstileToken()) return;

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          captchaToken: activeTurnstileToken || undefined,
          data: {
            full_name: cleanName,
            display_name: cleanName,
            username: cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 25),
          },
        },
      });

      if (error) {
        if (error.status === 429) {
          const match = error.message.match(/(\d+)\s*seconds?/i);
          if (match && match[1]) {
            setCooldown(parseInt(match[1], 10));
          }
          setErrorMsg("Batas pengiriman email tercapai. Silakan tunggu.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setPendingEmail(cleanEmail);
        setCooldown(60);
        setOtpCode("");
        if (data.session) {
          closeAuthModal();
          const destination = getSafeReturnUrl();
          router.replace(destination);
        } else {
          openAuthModal("otp");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pendaftaran";
      setErrorMsg(msg);
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || otpCode.length < 6) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = otpCode.trim();

      // Verify OTP via Supabase Auth
      // Try type 'signup' first, fallback to 'email'
      let { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      if (error) {
        const emailVerify = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "email",
        });
        error = emailVerify.error;
      }

      if (error) {
        setErrorMsg(t.auth.invalid_otp_error);
        return;
      }

      closeAuthModal();
      const destination = getSafeReturnUrl();
      router.replace(destination);
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
    if (!hasTurnstileToken()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          captchaToken: activeTurnstileToken || undefined,
        },
      });

      if (error) {
        if (error.status === 429) {
          const match = error.message.match(/(\d+)\s*seconds?/i);
          setCooldown(match && match[1] ? parseInt(match[1], 10) : 60);
          setErrorMsg("Harap tunggu sebelum meminta kode OTP kembali.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setCooldown(60);
        setOtpCode("");
        setSuccessMsg(t.auth.resend_success);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulang OTP";
      setErrorMsg(msg);
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    if (!hasTurnstileToken()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/app/profile`,
        captchaToken: activeTurnstileToken || undefined,
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
      resetTurnstile();
      setLoading(false);
    }
  };

  const turnstileWidget = (
    <TurnstileWidget
      key={activeAuthModalView}
      resetKey={turnstileResetKey}
      onVerify={(token) => {
        setTurnstileToken(token);
        setTurnstileTokenView(activeAuthModalView);
        setErrorMsg(null);
      }}
      onExpire={() => {
        setTurnstileToken(null);
        setErrorMsg("Verifikasi Turnstile kedaluwarsa. Silakan verifikasi kembali.");
      }}
      onError={(error) => {
        console.error("Turnstile widget error:", error);
        setTurnstileToken(null);
        setErrorMsg(
          "Verifikasi Turnstile gagal. Pastikan site key dan domain ini terdaftar di Cloudflare."
        );
      }}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleCloseAuthModal}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 flex items-center justify-center mb-2">
            <Image
              src="/logo.svg"
              alt="MuaraKu Logo"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {activeAuthModalView === "login"
              ? t.auth.login_tab
              : activeAuthModalView === "register"
              ? t.auth.register_tab
              : activeAuthModalView === "otp"
              ? t.auth.otp_title
              : t.auth.forgot_password}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
            {activeAuthModalView === "login"
              ? (locale === "en" ? "Enter your email and password to access your account." : "Masukkan email dan kata sandi Anda untuk mengakses akun.")
              : activeAuthModalView === "register"
              ? (locale === "en" ? "Create an account to join the community." : "Daftar untuk mulai membantu komunitas menemukan barang.")
              : activeAuthModalView === "otp"
              ? `${t.auth.otp_desc} ${maskedEmail}`
              : t.auth.recovery_email_desc}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {displayedError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{displayedError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* GOOGLE OAUTH BUTTON (LOGIN & REGISTER) */}
        {(activeAuthModalView === "login" || activeAuthModalView === "register") && (
          <div className="space-y-4 mb-4">
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-100 text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {oauthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{t.auth.google_signin}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-[#18181B] px-3 text-[11px] font-semibold uppercase text-zinc-400">
                {locale === "en" ? "Or with email" : "Atau dengan email"}
              </span>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {activeAuthModalView === "login" && (
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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
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
                  className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Turnstile Widget */}
            {turnstileWidget}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.login_button}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {locale === "en" ? "Don't have an account? " : "Belum punya akun? "}
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {t.auth.register_button}
                </button>
              </span>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {activeAuthModalView === "register" && (
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.name_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

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
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          step <= strengthScore ? strengthColor.split(" ")[0] : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Kekuatan kata sandi:</span>
                    <span className={`font-semibold ${strengthColor.split(" ")[1]}`}>{strengthLabel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id={termsCheckboxId}
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor={termsCheckboxId} className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                Saya menyetujui{" "}
                <a href="/terms" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline">
                  Ketentuan Layanan
                </a>{" "}
                dan{" "}
                <a href="/privacy" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline">
                  Kebijakan Privasi
                </a>{" "}
                MuaraKu.
              </label>
            </div>

            {/* Turnstile Widget */}
            {turnstileWidget}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.register_button}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {locale === "en" ? "Already have an account? " : "Sudah punya akun? "}
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {t.auth.login_tab}
                </button>
              </span>
            </div>
          </form>
        )}

        {/* OTP VERIFICATION VIEW */}
        {activeAuthModalView === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t.auth.otp_code_label}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center font-mono text-lg tracking-[0.5em] font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

            {turnstileWidget}

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
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
                  className="font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {t.auth.resend_otp}
                </button>
              )}

              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mt-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.auth.change_email}
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {activeAuthModalView === "forgot" && (
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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

            {turnstileWidget}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.auth.send_recovery_instructions}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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
