"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Globe, Menu, X } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLocale = () => {
    setLocale(locale === "id" ? "en" : "id");
  };

  // Nav links based directly on Document/Inspiration/Navbar.png: Home | About | Support | Terms
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#121214]/80 border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand: Logo + MuaraKu text in brand orange */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo.svg"
              alt="MuaraKu Logo"
              width={30}
              height={30}
              priority
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#FB923C] dark:text-[#FB923C]">
            MuaraKu
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-[#FB923C]"
                    : "text-zinc-800 dark:text-zinc-200 hover:text-[#FB923C] dark:hover:text-[#FB923C]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools: Theme Pill, Language Pill, CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Pill Toggle [ ☼ ☾ ] */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700 transition-colors min-h-[38px]"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            <Sun className={`w-3.5 h-3.5 ${theme === "dark" ? "text-zinc-400" : "text-amber-500 font-bold"}`} />
            <Moon className={`w-3.5 h-3.5 ${theme === "dark" ? "text-orange-400 font-bold" : "text-zinc-400"}`} />
          </button>

          {/* Language Pill Toggle [ 🌐 EN / ID ] */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold transition-colors min-h-[38px]"
            title="Switch language"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span className="uppercase">{locale}</span>
          </button>

          {/* CTA: Login (before auth) or Open App (after auth) */}
          {user ? (
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#FB923C] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors min-h-[40px]"
            >
              Open App
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#FB923C] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors min-h-[40px] cursor-pointer"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger & Quick Theme */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-zinc-600" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-800 dark:text-zinc-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] px-6 py-5 space-y-4 shadow-lg animate-fade-in">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 text-base font-medium rounded-lg px-2 transition-colors ${
                  pathname === link.href
                    ? "text-[#FB923C] bg-orange-500/10 font-bold"
                    : "text-zinc-800 dark:text-zinc-200 hover:text-[#FB923C]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Bahasa: {locale.toUpperCase()}</span>
            </button>
          </div>

          <div className="pt-2">
            {user ? (
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#FB923C] hover:bg-[#EA580C] text-white text-center font-semibold rounded-xl text-sm flex items-center justify-center shadow-xs"
              >
                Open App
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="w-full py-3 bg-[#FB923C] hover:bg-[#EA580C] text-white text-center font-semibold rounded-xl text-sm flex items-center justify-center shadow-xs cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
