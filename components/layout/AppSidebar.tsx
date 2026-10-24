"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Compass,
  PackageSearch,
  PackageCheck,
  Search,
  Globe2,
  Mail,
  HelpCircle,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  MoreHorizontal,
  User as UserIcon,
} from "lucide-react";
import { SettingsOverlay } from "@/components/overlays/SettingsOverlay";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenReportModal?: (type?: "lost" | "found") => void;
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
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { locale } = useI18n();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Desktop collapsed state
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  const toggleCollapsed = () => {
    const next = !collapsed;
    localStorage.setItem("muaraku_sidebar_collapsed", String(next));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  };

  // Main menu items from Sidebar reference
  const mainMenuItems = [
    { href: "/app", label: "Discover", icon: Compass, hasSubmenu: false },
    { href: "/app/seeker", label: "Seeker", icon: PackageSearch, hasSubmenu: true },
    { href: "/app/finder", label: "Finder", icon: PackageCheck, hasSubmenu: true },
    { href: "/app/search", label: "Search", icon: Search, hasSubmenu: false },
    { href: "/app/community", label: "Global Chat", icon: Globe2, hasSubmenu: false },
    { href: "/app/messages", label: "Message", icon: Mail, hasSubmenu: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Element */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-200 select-none ${
          collapsed ? "md:w-[72px]" : "md:w-[240px]"
        } ${mobileOpen ? "left-0 w-[240px]" : "-left-[260px] md:left-0"}`}
      >
        {/* Top & Navigation Container */}
        <div className="p-3.5 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Header Lockup: Logo + MuaraKu.id + Toggle */}
          <div
            className={`flex items-center justify-between px-1 py-1 ${
              collapsed ? "flex-col gap-3 justify-center" : ""
            }`}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt="MuaraKu Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              {!collapsed && (
                <span className="font-bold text-base tracking-tight text-[#FB923C]">
                  MuaraKu.id
                </span>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* MAIN MENU Section */}
          <div className="space-y-1.5">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Main Menu
              </p>
            )}

            <div className="space-y-1">
              {mainMenuItems.map((item) => {
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
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? "text-orange-500"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.hasSubmenu && (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SETTINGS Section */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Settings
              </p>
            )}

            <div className="space-y-1">
              {/* Help Center */}
              <Link
                href="/support"
                title={collapsed ? "Help Center" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                }`}
              >
                <HelpCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                {!collapsed && <span>Help Center</span>}
              </Link>

              {/* Settings (Opens Overlay as required by product rules) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title={collapsed ? "Settings" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer ${
                  collapsed ? "justify-center px-0" : ""
                }`}
              >
                <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                {!collapsed && <span>Settings</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Profile Bar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div
            className={`flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${
              collapsed ? "justify-center p-1" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-orange-500/20 overflow-hidden">
              {profile?.display_name ? (
                profile.display_name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {profile?.display_name || (user ? user.email?.split("@")[0] : "Tamu")}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {user?.email || (locale === "en" ? "Guest User" : "Pengguna Tamu")}
                </p>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="User options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Settings Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
