"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ArrowLeftRight, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
  const { openAuthModal } = useAuth();
  const { locale } = useI18n();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-overlay-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <h2
            id="settings-overlay-title"
            className="text-base font-bold text-zinc-900 dark:text-zinc-100"
          >
            {locale === "en" ? "Settings" : "Pengaturan"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: ONLY Switch Account and Home per AGENTS.md product decisions */}
        <div className="p-4 space-y-2">
          {/* Item 1: Switch Account */}
          <button
            onClick={() => {
              onClose();
              openAuthModal("login");
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <div className="leading-tight">
                {locale === "en" ? "Switch Account" : "Ganti Akun"}
              </div>
              <div className="text-[11px] font-normal text-zinc-400">
                {locale === "en"
                  ? "Sign in with a different account"
                  : "Masuk menggunakan akun yang berbeda"}
              </div>
            </div>
          </button>

          {/* Item 2: Home (leads to /) */}
          <Link
            href="/"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="leading-tight">
                {locale === "en" ? "Home" : "Beranda"}
              </div>
              <div className="text-[11px] font-normal text-zinc-400">
                {locale === "en"
                  ? "Back to landing page"
                  : "Kembali ke halaman utama"}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
