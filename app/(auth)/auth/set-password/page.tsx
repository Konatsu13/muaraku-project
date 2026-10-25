"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/config/site";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
  LogOut,
} from "lucide-react";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signOut } = useAuth();
  const { t, locale } = useI18n();
  const supabase = React.useMemo(() => createClient(), []);

  const nextDestination = sanitizeNextPath(searchParams.get("next"), "/app");
  // Recovery mode: the password-reset email link lands here with ?recovery=1,
  // so the signed-in user may set a new password even when they are not a
  // Google user (email/password users normally skip this page).
  const isRecovery = Boolean(searchParams.get("recovery"));

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in or if a Google user opens this optional page
  // after already setting a password.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/?auth=login");
      return;
    }

    const isGoogleUser =
      user.app_metadata?.provider === "google" ||
      user.app_metadata?.providers?.includes("google");
    const hasPasswordSet = Boolean(user.app_metadata?.password_set);

    // Recovery users always keep the form; otherwise only Google users who
    // have not set a password may use this optional page.
    if (!isRecovery && (!isGoogleUser || hasPasswordSet)) {
      router.replace(nextDestination);
    }
  }, [user, isLoading, router, nextDestination, isRecovery]);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumberOrSymbol].filter(
    Boolean
  ).length;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Kata sandi minimal 8 karakter.");
      return;
    }
    if (strengthScore < 3) {
      setErrorMsg("Gunakan kombinasi huruf besar, huruf kecil, dan angka/simbol untuk keamanan.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError && updateError.code !== "same_password") {
        throw new Error(updateError.message);
      }

      // Refresh the session whether the password changed or was already set.
      await supabase.auth.refreshSession();

      setSuccess(true);
      setTimeout(() => {
        router.replace(nextDestination);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kata sandi baru.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (!user && !errorMsg)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-[#18181B]">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-canvas dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <Image
              src="/logo.svg"
              alt="MuaraKu Logo"
              width={36}
              height={36}
              className="object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold tracking-tight text-[#FB923C]">MuaraKu</span>
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {locale === "en"
              ? isRecovery
                ? "Set a New Password"
                : "Set Account Password"
              : isRecovery
              ? "Buat Kata Sandi Baru"
              : "Buat Kata Sandi Akun"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
            {isRecovery
              ? locale === "en"
                ? "You signed in via a password-reset link. Choose a new password for your account."
                : "Anda masuk melalui tautan pemulihan kata sandi. Pilih kata sandi baru untuk akun Anda."
              : locale === "en"
              ? "Your account was created via Google. Create a secure password to complete your profile setup."
              : "Akun Anda masuk melalui Google. Buat kata sandi mandiri untuk mengamankan akses akun MuaraKu Anda."}
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {locale === "en"
                  ? "Password successfully created! Redirecting to app..."
                  : "Kata sandi berhasil disimpan! Mengarahkan ke aplikasi..."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {locale === "en" ? "New Password" : "Kata Sandi Baru"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          step <= strengthScore
                            ? strengthColor.split(" ")[0]
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{locale === "en" ? "Strength:" : "Kekuatan kata sandi:"}</span>
                    <span className={`font-semibold ${strengthColor.split(" ")[1]}`}>
                      {strengthLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {locale === "en" ? "Confirm Password" : "Konfirmasi Kata Sandi"}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Info notice (Google onboarding only; not shown in recovery mode) */}
            {!isRecovery && (
              <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>
                  {locale === "en"
                    ? "This password allows you to log in with your email directly if you cannot access Google."
                    : "Kata sandi ini memungkinkan Anda masuk langsung dengan email tanpa bergantung pada Google."}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{locale === "en" ? "Save & Continue" : "Simpan & Lanjutkan"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Escape hatch: sign out */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Sign out / Use another account" : "Keluar / Ganti akun"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-[#18181B]">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
