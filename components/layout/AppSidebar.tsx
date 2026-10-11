"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Compass,
  Search,
  Package,
  Sparkles,
  MessageSquare,
  Users,
  User as UserIcon,
  Settings,
  HelpCircle,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  PlusCircle,
} from "lucide-react";

interface AppSidebarProps {
  onOpenReportModal?: (type?: "lost" | "found") => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SIDEBAR_EVENT = "muaraku_sidebar_toggle";

function subscribeSidebar(callback: () => void) {
  window.addEventListener(SIDEBAR_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSidebarSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("muaraku_sidebar_collapsed") === "true";
}

function getServerSidebarSnapshot(): boolean {
  return false;
}

export function AppSidebar({
  onOpenReportModal,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, profile, isAdmin, isModerator, signOut, openAuthModal } = useAuth();
  const { t } = useI18n();

  // Desktop collapsed state
  const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, getServerSidebarSnapshot);

  const toggleCollapsed = () => {
    const next = !collapsed;
    localStorage.setItem("muaraku_sidebar_collapsed", String(next));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  };

  const mainNavItems = [
    { href: "/app", label: t.nav.discover, icon: Compass },
    { href: "/app/seeker", label: t.nav.seeker, icon: Search },
    { href: "/app/finder", label: t.nav.finder, icon: Package },
    { href: "/app/search", label: t.nav.search, icon: Sparkles },
    { href: "/app/community", label: t.nav.community, icon: Users },
    { href: "/app/messages", label: t.nav.messages, icon: MessageSquare },
  ];

  const secondaryNavItems = [
    { href: "/app/profile", label: t.nav.profile, icon: UserIcon },
    { href: "/app/settings", label: t.nav.settings, icon: Settings },
    { href: "/app/help", label: t.nav.help, icon: HelpCircle },
  ];

  if (isAdmin || isModerator) {
    secondaryNavItems.push({
      href: "/admin",
      label: t.nav.admin,
      icon: ShieldCheck,
    });
  }

  const renderNavList = (items: typeof mainNavItems) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onMobileClose && onMobileClose()}
            title={collapsed ? item.label : undefined}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-orange-500 before:rounded-r"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500"}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-200 select-none ${
          /* Desktop Width */
          collapsed ? "md:w-[76px]" : "md:w-[240px]"
        } ${
          /* Mobile Visibility */
          mobileOpen ? "left-0 w-[240px]" : "-left-[260px] md:left-0"
        }`}
      >
        {/* Top Section */}
        <div className="p-3 sm:p-3.5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Brand & Collapse Header */}
          <div className={`flex items-center justify-between px-1 py-1 ${collapsed ? "flex-col gap-3" : ""}`}>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-sm transition-transform group-hover:scale-105">
                M
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                    MuaraKu<span className="text-orange-500">.id</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-none">
                    Lost &amp; Found
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Button */}
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Create Report Button */}
          {onOpenReportModal && (
            <button
              onClick={() => {
                if (user) {
                  onOpenReportModal("lost");
                } else {
                  openAuthModal("login");
                }
              }}
              className={`w-full py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95 ${
                collapsed ? "px-0" : ""
              }`}
              title="Buat Laporan Baru"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Buat Laporan</span>}
            </button>
          )}

          {/* Main Navigation Group */}
          <div>
            {!collapsed && (
              <span className="px-2 text-[10px] font-bold tracking-wider uppercase text-zinc-400 block mb-1.5">
                {t.nav.main_menu}
              </span>
            )}
            {renderNavList(mainNavItems)}
          </div>

          {/* Preferences & Secondary Group */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            {!collapsed && (
              <span className="px-2 text-[10px] font-bold tracking-wider uppercase text-zinc-400 block mb-1.5">
                {t.nav.preferences}
              </span>
            )}
            {renderNavList(secondaryNavItems)}
          </div>
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          {user ? (
            <div className={`flex items-center justify-between gap-2 ${collapsed ? "flex-col" : ""}`}>
              <Link
                href="/app/profile"
                className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "justify-center" : ""}`}
                title={profile?.display_name || user.email || "Pengguna"}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {profile?.avatar_path ? (
                    <img src={profile.avatar_path} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (profile?.display_name || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {profile?.display_name || "Pengguna"}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {user.email}
                    </span>
                  </div>
                )}
              </Link>

              {/* Sign out button */}
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={t.nav.logout}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className={`w-full py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                collapsed ? "px-0" : ""
              }`}
            >
              <UserIcon className="w-4 h-4" />
              {!collapsed && <span>{t.nav.login}</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
