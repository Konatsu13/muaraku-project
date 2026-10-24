"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Globe,
  Plus,
  Settings,
} from "lucide-react";

interface AppHeaderProps {
  onOpenSettings: () => void;
  onOpenReportModal?: (type?: "lost" | "found") => void;
}

export function AppHeader({ onOpenSettings, onOpenReportModal }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, openAuthModal } = useAuth();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for Cmd+F / Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        router.push("/app/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Real unread count for the bell. RLS limits the count to this user's rows.
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    const supabase = createClient();

    const loadUnreadCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_user_id", user.id)
        .is("read_at", null);

      if (!cancelled && !error) {
        setUnreadCount(count ?? 0);
      }
    };

    loadUnreadCount();

    const handleNotificationsChanged = () => {
      loadUnreadCount();
    };
    window.addEventListener("muaraku_notifications_changed", handleNotificationsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("muaraku_notifications_changed", handleNotificationsChanged);
    };
  }, [user?.id, pathname]);

  const toggleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  const toggleLocale = () => {
    setLocale(locale === "id" ? "en" : "id");
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Link
          href="/app/search"
          className="w-full flex items-center justify-between px-3.5 py-2 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors" />
            <span className="truncate">Cari barang dengan bahasa alami...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded">
            ⌘F
          </kbd>
        </Link>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Create Report Button (Desktop) */}
        {onOpenReportModal && (
          <button
            onClick={() => {
              if (user) {
                onOpenReportModal("lost");
              } else {
                openAuthModal("login");
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Lapor Barang</span>
          </button>
        )}

        {/* Notification Bell */}
        <Link
          href="/app/notifications"
          className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Notifikasi"
          aria-label={
            unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"
          }
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-zinc-900"
            />
          )}
        </Link>

        {/* Settings (mobile only; desktop has the sidebar) */}
        <button
          onClick={onOpenSettings}
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Buka pengaturan"
          title="Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Language Switcher Pill */}
        <button
          onClick={toggleLocale}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200/80 dark:border-zinc-700 transition-colors"
          title="Ganti Bahasa"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span className="uppercase">{locale}</span>
        </button>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title={
            theme === "system"
              ? "Tema: Sistem (Klik untuk Gelap)"
              : theme === "dark"
              ? "Tema: Gelap (Klik untuk Terang)"
              : "Tema: Terang (Klik untuk Sistem)"
          }
        >
          {theme === "system" ? (
            <Laptop className="w-4 h-4 text-orange-500" />
          ) : theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* User Avatar Pill */}
        {user ? (
          <Link href="/app/profile" className="flex items-center gap-2 pl-1 sm:pl-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs ring-1 ring-orange-500/30 overflow-hidden">
              {profile?.avatar_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_path}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (profile?.display_name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
          >
            Masuk
          </button>
        )}
      </div>
    </header>
  );
}
