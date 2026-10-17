"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import {
  Sun,
  Moon,
  Laptop,
  Globe,
  Bell,
  Lock,
  UserX,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  // Notification preferences state
  const [matchNotif, setMatchNotif] = useState(true);
  const [msgNotif, setMsgNotif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  // Blocked users state (real persistence)
  const [blockedUsers, setBlockedUsers] = useState<{ id: string; name: string }[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Status feedback
  const [generalFeedback, setGeneralFeedback] = useState<string | null>(null);

  // Load preferences and blocked users on mount
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      // 1. Notification preferences
      const { data: prefData } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefData) {
        setMatchNotif(prefData.in_app_matches ?? true);
        setMsgNotif(prefData.in_app_messages ?? true);
      }

      // 2. Blocked users
      setLoadingBlocks(true);
      const { data: blocksData } = await supabase
        .from("user_blocks")
        .select(`
          blocked_user_id,
          user_profiles:blocked_user_id (
            display_name
          )
        `)
        .eq("blocker_user_id", user.id);

      if (blocksData) {
        const mapped = blocksData.map((b: { blocked_user_id: string; user_profiles: unknown }) => {
          const prof = b.user_profiles as { display_name?: string } | null;
          return {
            id: b.blocked_user_id,
            name: prof?.display_name || "Pengguna",
          };
        });
        setBlockedUsers(mapped);
      }
      setLoadingBlocks(false);
    };

    loadSettings();
  }, [user, supabase]);

  // Handle Theme change with persistence to user_profiles
  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (user) {
      await supabase
        .from("user_profiles")
        .update({ theme: newTheme })
        .eq("user_id", user.id);
      refreshProfile();
    }
  };

  // Handle Locale change with persistence to user_profiles
  const handleLocaleChange = async (newLocale: "id" | "en") => {
    setLocale(newLocale);
    if (user) {
      await supabase
        .from("user_profiles")
        .update({ preferred_language: newLocale })
        .eq("user_id", user.id);
      refreshProfile();
    }
  };

  // Handle saving notification preferences
  const handleSaveNotificationPref = async (newMatch: boolean, newMsg: boolean) => {
    setMatchNotif(newMatch);
    setMsgNotif(newMsg);
    if (!user) return;

    setSavingNotif(true);
    try {
      await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        in_app_matches: newMatch,
        in_app_messages: newMsg,
        updated_at: new Date().toISOString(),
      });
      setGeneralFeedback(t.settings.notif_saved);
      setTimeout(() => setGeneralFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotif(false);
    }
  };

  // Handle unblocking user
  const handleUnblock = async (blockedUserId: string) => {
    if (!user) return;
    if (confirm(t.settings.unblock_confirm)) {
      await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_user_id", user.id)
        .eq("blocked_user_id", blockedUserId);

      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedUserId));
    }
  };

  // Handle password update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 8) {
      setPassError(t.settings.password_min_error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(t.settings.password_mismatch);
      return;
    }

    setChangingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPassError(error.message);
      } else {
        setPassSuccess(t.settings.password_updated);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui kata sandi";
      setPassError(msg);
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {t.settings.settings_subtitle}
        </p>
      </div>

      {generalFeedback && (
        <div className="flex items-center gap-2 p-3 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{generalFeedback}</span>
        </div>
      )}

      {/* 1. THEME SETTING */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-orange-500" />
          <span>{t.settings.appearance_tab}</span>
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange("light")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">{t.settings.theme_light}</span>
          </button>

          <button
            onClick={() => handleThemeChange("dark")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">{t.settings.theme_dark}</span>
          </button>

          <button
            onClick={() => handleThemeChange("system")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "system"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span className="text-xs">{t.settings.theme_system}</span>
          </button>
        </div>
      </div>

      {/* 2. LANGUAGE SETTING */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-500" />
          <span>{t.settings.language_tab}</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLocaleChange("id")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              locale === "id"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            <div>
              <p className="text-xs font-bold">Bahasa Indonesia</p>
              <p className="text-[11px] text-zinc-400">Bahasa bawaan komunitas</p>
            </div>
            {locale === "id" && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
          </button>

          <button
            onClick={() => handleLocaleChange("en")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              locale === "en"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            <div>
              <p className="text-xs font-bold">English</p>
              <p className="text-[11px] text-zinc-400">International language</p>
            </div>
            {locale === "en" && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATION PREFERENCES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" />
            <span>{t.settings.notif_title}</span>
          </h2>
          {savingNotif && (
            <span className="text-[11px] text-orange-500 flex items-center gap-1 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t.settings.saving}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
            <div className="pr-4">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {t.settings.notif_match_title}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.settings.notif_match_desc}
              </p>
            </div>
            <input
              type="checkbox"
              checked={matchNotif}
              onChange={(e) => handleSaveNotificationPref(e.target.checked, msgNotif)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
            <div className="pr-4">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {t.settings.notif_msg_title}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.settings.notif_msg_desc}
              </p>
            </div>
            <input
              type="checkbox"
              checked={msgNotif}
              onChange={(e) => handleSaveNotificationPref(matchNotif, e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 4. CHANGE PASSWORD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-500" />
          <span>{t.settings.change_password}</span>
        </h2>

        {passError && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.settings.new_password_label}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.settings.confirm_password_label}
            </label>
            <input
              type={showPass ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass || !newPassword}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {changingPass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{t.settings.update_password}</span>
          </button>
        </form>
      </div>

      {/* 5. BLOCKED USERS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserX className="w-4 h-4 text-orange-500" />
          <span>{t.settings.blocked_title}</span>
        </h2>

        {loadingBlocks ? (
          <p className="text-xs text-zinc-400">{t.settings.blocked_loading}</p>
        ) : blockedUsers.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
            {blockedUsers.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{b.name}</span>
                <button
                  onClick={() => handleUnblock(b.id)}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {t.common.unblock}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            {t.settings.no_blocked_users}
          </p>
        )}
      </div>

      {/* 6. LOGOUT ACTION */}
      {user && (
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm(t.settings.logout_confirm)) {
                signOut();
              }
            }}
            className="w-full py-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.settings.signout_button}</span>
          </button>
        </div>
      )}
    </div>
  );
}
