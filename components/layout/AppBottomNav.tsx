"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  PackageSearch,
  PackageCheck,
  Search,
  Globe2,
  Mail,
} from "lucide-react";

/**
 * Mobile main-menu dock for the authenticated app area.
 * It mirrors only the main menu destinations; Settings and Help stay in the
 * desktop sidebar / settings overlay so the bottom bar stays a navigation.
 */
const MAIN_MENU = [
  { href: "/app", label: "Discover", icon: Compass },
  { href: "/app/seeker", label: "Seeker", icon: PackageSearch },
  { href: "/app/finder", label: "Finder", icon: PackageCheck },
  { href: "/app/search", label: "Search", icon: Search },
  { href: "/app/community", label: "Global Chat", icon: Globe2 },
  { href: "/app/messages", label: "Message", icon: Mail },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden shrink-0 px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Menu utama aplikasi"
        className="mx-auto max-w-md rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-[#18181B]/95 p-1.5 shadow-[0_14px_36px_-18px_rgba(24,24,27,0.55)] backdrop-blur-xl"
      >
        <div className="grid grid-cols-6 gap-1">
          {MAIN_MENU.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium tracking-tight transition-all duration-150 active:scale-[0.97] ${
                  isActive
                    ? "bg-orange-500/10 font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  strokeWidth={isActive ? 2.4 : 1.9}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
