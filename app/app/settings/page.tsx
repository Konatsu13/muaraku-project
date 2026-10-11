"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n, Locale } from "@/lib/i18n";
import { useTheme, Theme } from "@/lib/theme";
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Globe,
  Bell,
  Shield,
  UserX,
  LogOut,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

  const [emailNotif, setEmailNotif] = useState(true);
  const [matchNotif, setMatchNotif] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([
    "SpammerAccount99",
  ]);

  const handleUnblock = (username: string) => {
    if (confirm(t.settings.unblock_confirm)) {
      setBlockedUsers((prev) => prev.filter((u) => u !== username));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Kelola preferensi akun, tampilan, privasi, dan bahasa MuaraKu Anda.
        </p>
      </div>

      {/* 1. THEME SETTING */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-orange-500" />
          <span>{t.settings.appearance_tab}</span>
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">{t.settings.theme_light}</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">{t.settings.theme_dark}</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === "system"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
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
            onClick={() => setLocale("id")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              locale === "id"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <div>
              <p className="text-xs font-bold">Bahasa Indonesia</p>
              <p className="text-[11px] text-zinc-400">Bahasa bawaan komunitas</p>
            </div>
            {locale === "id" && <CheckCircle className="w-4 h-4 text-orange-500" />}
          </button>

          <button
            onClick={() => setLocale("en")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              locale === "en"
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <div>
              <p className="text-xs font-bold">English</p>
              <p className="text-[11px] text-zinc-400">International language</p>
            </div>
            {locale === "en" && <CheckCircle className="w-4 h-4 text-orange-500" />}
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATION PREFERENCES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <span>Pengaturan Notifikasi</span>
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Notifikasi Kecocokan AI Matching
              </p>
              <p className="text-[11px] text-zinc-400">
                Dapatkan pemberitahuan instan saat ada barang temuan yang mirip laporan Anda.
              </p>
            </div>
            <input
              type="checkbox"
              checked={matchNotif}
              onChange={(e) => setMatchNotif(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Notifikasi Pesan &amp; Klaim Masuk
              </p>
              <p className="text-[11px] text-zinc-400">
                Pemberitahuan saat ada pesan atau verifikasi klaim baru dari pengguna lain.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* 4. BLOCKED USERS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserX className="w-4 h-4 text-orange-500" />
          <span>{t.settings.blocked_title}</span>
        </h2>

        {blockedUsers.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
            {blockedUsers.map((uname) => (
              <div
                key={uname}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{uname}</span>
                <button
                  onClick={() => handleUnblock(uname)}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {t.common.unblock}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">{t.settings.blocked_empty}</p>
        )}
      </div>

      {/* 5. LOGOUT ACTION */}
      {user && (
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm(t.settings.logout_confirm)) {
                signOut();
              }
            }}
            className="w-full py-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun MuaraKu</span>
          </button>
        </div>
      )}
    </div>
  );
}
