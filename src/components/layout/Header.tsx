'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, isSupabaseConfigured } from '../../lib/supabase';
import { NotificationItem } from '../../types';

interface HeaderProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
  onSearchSubmit?: (query: string) => void;
  onOpenReportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute = 'discover',
  onNavigate,
  onSearchSubmit,
  onOpenReportModal,
}) => {
  const {
    currentUser,
    isAuthenticated,
    theme,
    toggleTheme,
    logout,
    openAuthModal,
    setTargetRedirect,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await db.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery);
      }
      onNavigate('search');
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await db.markNotificationRead(notif.id);
    await loadNotifications();
    if (notif.link_route) {
      onNavigate(notif.link_route);
    }
    setIsNotifOpen(false);
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setTargetRedirect?.('report');
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onOpenReportModal?.();
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
  };

  const navLinks = [
    { id: 'discover', label: 'Eksplorasi', icon: 'explore' },
    { id: 'seeker', label: 'Barang Hilang', icon: 'search' },
    { id: 'finder', label: 'Barang Ditemukan', icon: 'inventory_2' },
    { id: 'search', label: 'Cari Cepat', icon: 'manage_search' },
    { id: 'global-chat', label: 'Diskusi', icon: 'forum', badge: 'LIVE' },
    { id: 'admin', label: 'Pos Satpam', icon: 'admin_panel_settings' },
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'staff':
        return 'Petugas Pos';
      case 'admin':
        return 'Admin TU';
      default:
        return 'Siswa';
    }
  };

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-300 glass-header-premium border border-border-subtle/80 dark:border-white/10 ${
          scrolled
            ? 'shadow-[0_12px_36px_-6px_rgba(24,24,27,0.12)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-surface-white/85 dark:bg-dark-surface/85'
            : 'shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl bg-surface-white/75 dark:bg-dark-surface/75'
        }`}
      >
        <div className="px-3.5 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Identity with Wave Logo & Glass Sheen */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
            onClick={() => onNavigate('discover')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 flex items-center justify-center shadow-sm shadow-orange-500/15 ring-1 ring-white/50 dark:ring-white/10 group-hover:scale-105 group-hover:shadow-orange-500/30 transition-all p-1.5">
                <img src="/logo.svg" alt="MuaraKu" className="w-full h-full object-contain" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-dark-surface" />
            </div>

            <div className="flex flex-col">
              <span className="font-headline-md text-base sm:text-lg font-bold tracking-tight text-on-surface dark:text-surface-white group-hover:text-primary-container transition-colors">
                MuaraKu
              </span>
              <span className="text-[10px] font-semibold text-primary-container -mt-1 hidden sm:inline-block tracking-wide">
                Lost & Found Sekolah
              </span>
            </div>
          </div>

          {/* Center: Floating Segmented Navigation Pills (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl glass-surface border border-border-subtle/80 dark:border-white/10 inner-light shadow-xs">
            {navLinks.map((tab) => {
              const isActive = currentRoute === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-white shadow-sm shadow-orange-500/30'
                      : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isActive
                          ? 'bg-white text-orange-600 shadow-xs'
                          : 'bg-primary-container text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Shortcut Input (Medium+ screens) */}
            <div className="relative hidden xl:block w-48 2xl:w-56 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-[17px] group-focus-within:text-primary-container transition-colors">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari barang..."
                className="w-full h-9 pl-9 pr-8 rounded-xl input-premium text-xs text-on-surface dark:text-surface-white placeholder:text-muted-text focus:outline-none transition-all"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-text bg-soft-surface dark:bg-dark-surface px-1.5 py-0.5 rounded border border-border-subtle/80 dark:border-white/10 shadow-2xs">
                ↵
              </kbd>
            </div>

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
              title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Auth-Aware Section */}
            {isAuthenticated ? (
              <>
                {/* Notifications Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative w-9 h-9 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
                    title="Notifikasi"
                  >
                    <span className="material-symbols-outlined text-[19px]">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container ring-2 ring-surface-white dark:ring-dark-surface" />
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 shadow-2xl z-50 overflow-hidden inner-light animate-in fade-in zoom-in-95">
                      <div className="p-3.5 border-b border-border-subtle/70 dark:border-dark-border flex items-center justify-between">
                        <span className="font-bold text-xs text-on-surface dark:text-surface-white flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary-container">notifications</span>
                          <span>Notifikasi Sistem</span>
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-border-subtle/60 dark:divide-dark-border/60 text-xs">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-muted-text text-xs space-y-1">
                            <span className="material-symbols-outlined text-2xl text-muted-text/50">notifications_off</span>
                            <p>Belum ada notifikasi baru</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="p-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-semibold text-on-surface dark:text-surface-white">{n.title}</p>
                                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />}
                              </div>
                              <p className="text-secondary-ink dark:text-muted-text text-[11px] mt-0.5 line-clamp-2">
                                {n.description}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Dropdown: Profile, Settings, Dev switcher, Logout */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 hover:border-primary-container/40 active:scale-95 transition-all shadow-xs"
                    title="Menu Profil"
                  >
                    <img
                      src={
                        currentUser?.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                      }
                      alt={currentUser?.name || 'User'}
                      className="w-6 h-6 rounded-lg object-cover ring-1 ring-primary-container/30"
                    />
                    <span className="hidden sm:inline text-xs font-semibold text-on-surface dark:text-surface-white truncate max-w-[100px]">
                      {currentUser?.name || 'Profil'}
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-muted-text">expand_more</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 shadow-2xl z-50 p-2 divide-y divide-border-subtle/70 dark:divide-dark-border inner-light animate-in fade-in zoom-in-95">
                      {/* User Info Header */}
                      <div className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              currentUser?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                            }
                            alt={currentUser?.name || 'User'}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-primary-container/40"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-on-surface dark:text-surface-white truncate">
                              {currentUser?.name || 'Pengguna'}
                            </p>
                            <p className="text-[11px] text-muted-text truncate">{currentUser?.email}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-primary-container/15 text-primary-container">
                              {getRoleLabel(currentUser?.role)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nav Actions */}
                      <div className="py-1 space-y-0.5 text-xs">
                        <button
                          onClick={() => {
                            onNavigate('profile');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-on-surface dark:text-surface-white"
                        >
                          <span className="material-symbols-outlined text-primary-container text-[18px]">person</span>
                          <span>Profil Warga</span>
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('settings');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-on-surface dark:text-surface-white"
                        >
                          <span className="material-symbols-outlined text-muted-text text-[18px]">settings</span>
                          <span>Pengaturan</span>
                        </button>
                      </div>

                      {/* Logout Option */}
                      <div className="pt-1 text-xs">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-error-destructive hover:bg-error-destructive/10 transition-colors font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* High-Impact CTA: + Lapor Barang (Authenticated) */}
                <button
                  onClick={handleReportClick}
                  className="h-9 px-3.5 sm:px-4 rounded-xl btn-premium text-white text-xs font-bold shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all ring-1 ring-white/30"
                >
                  <span className="material-symbols-outlined text-[17px]">add_circle</span>
                  <span className="hidden sm:inline">+ Lapor Barang</span>
                  <span className="sm:hidden">+ Lapor</span>
                </button>
              </>
            ) : (
              <>
                {/* Unauthenticated: Masuk & Daftar buttons */}
                <button
                  onClick={() => onNavigate('login')}
                  className="h-9 px-3.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-xs font-semibold text-on-surface dark:text-surface-white hover:border-primary-container/40 hover:text-primary-container active:scale-95 transition-all shadow-xs"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-500/25 flex items-center gap-1 transition-all ring-1 ring-white/30"
                >
                  Daftar
                </button>
              </>
            )}

            {/* Mobile Navigation Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text flex items-center justify-center active:scale-95"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border-subtle/80 dark:border-white/10 px-4 py-3.5 animate-in fade-in slide-in-from-top-2">
            {!isAuthenticated && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border-subtle/70 dark:border-dark-border">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-center text-xs font-semibold border border-border-subtle dark:border-dark-border text-on-surface dark:text-surface-white hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                >
                  Daftar Akun
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onNavigate(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left font-medium transition-all ${
                    currentRoute === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs'
                      : 'glass-surface hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
