'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenReportModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenReportModal,
}) => {
  const { currentUser, isAuthenticated, logout, openAuthModal, setTargetRedirect } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const bottomItems = [
    { id: 'discover', label: 'Eksplorasi', icon: 'explore' },
    { id: 'seeker', label: 'Seeker', icon: 'person_search' },
    { id: 'action', label: 'Lapor', icon: 'add', isAction: true },
    { id: 'finder', label: 'Finder', icon: 'inventory_2' },
    { id: 'messages', label: 'Pesan', icon: 'forum', requiresAuth: true },
  ];

  const handleFabClick = () => {
    if (!isAuthenticated) {
      setTargetRedirect?.('report');
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onOpenReportModal();
  };

  const handleDrawerNavigate = (routeId: string, requiresAuth = false) => {
    setIsDrawerOpen(false);
    if (requiresAuth && !isAuthenticated) {
      setTargetRedirect?.(routeId);
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onNavigate(routeId);
  };

  const handleBottomItemClick = (item: (typeof bottomItems)[0]) => {
    if (item.isAction) {
      handleFabClick();
      return;
    }
    if (item.requiresAuth && !isAuthenticated) {
      setTargetRedirect?.(item.id);
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onNavigate(item.id);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'staff':
        return 'Petugas Satpam';
      case 'admin':
        return 'Admin TU';
      default:
        return 'Siswa';
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-20 bg-surface-white/85 dark:bg-dark-surface/85 backdrop-blur-xl px-4 py-3 border-b border-border-subtle/80 dark:border-white/10 flex items-center justify-between shadow-xs">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 19C5.34315 19 4 20.3431 4 22C4 23.6569 5.34315 25 7 25C8.65685 25 10 23.6569 10 22L12.5 13.5L16 20.5L19.5 13.5L22 22C22 23.6569 23.3431 25 25 25C26.6569 25 28 23.6569 28 22C28 20.3431 26.6569 19 25 19"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="7.5" r="3" stroke="white" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-headline-sm text-base font-bold text-on-surface dark:text-surface-white">
            MuaraKu
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('search')}
            className="p-2 rounded-xl text-secondary-ink dark:text-muted-text hover:bg-soft-surface dark:hover:bg-dark-canvas active:scale-95 transition-all"
            title="Cari"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl text-secondary-ink dark:text-muted-text hover:bg-soft-surface dark:hover:bg-dark-canvas active:scale-95 transition-all"
            title="Menu Drawer"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-dark-canvas/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-[85%] bg-surface-white dark:bg-dark-surface h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200 border-r border-border-subtle/70 dark:border-dark-border">
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/80 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    M
                  </div>
                  <span className="font-headline-sm text-base font-bold text-on-surface dark:text-surface-white">
                    MuaraKu
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-muted-text hover:text-on-surface dark:hover:text-surface-white active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* User Chip or Login prompt */}
              {isAuthenticated && currentUser ? (
                <div
                  onClick={() => handleDrawerNavigate('profile', true)}
                  className="flex items-center gap-3 p-3 rounded-2xl glass-surface border border-border-subtle/80 dark:border-white/10 cursor-pointer hover:border-primary-container/40 transition-colors shadow-xs"
                >
                  <img
                    src={
                      currentUser.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-container/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-on-surface dark:text-surface-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-muted-text truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-primary-container">
                        {getRoleLabel(currentUser.role)}
                      </span>
                      {currentUser.civic_karma !== undefined && (
                        <span className="text-[9px] font-mono text-amber-500 font-bold">
                          • {currentUser.civic_karma} pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-primary-container/20 space-y-2.5">
                  <p className="text-xs font-bold text-on-surface dark:text-surface-white">
                    Selamat Datang di MuaraKu
                  </p>
                  <p className="text-[11px] text-muted-text">
                    Masuk atau buat akun untuk melapor, klaim, dan bertukar pesan.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleDrawerNavigate('login')}
                      className="py-2 px-3 rounded-xl border border-border-subtle/80 dark:border-dark-border text-center text-xs font-semibold text-on-surface dark:text-surface-white bg-surface-white dark:bg-dark-surface hover:bg-black/5 active:scale-95 transition-all"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => handleDrawerNavigate('signup')}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all"
                    >
                      Daftar
                    </button>
                  </div>
                </div>
              )}

              {/* Nav Links in Drawer */}
              <div className="space-y-1">
                <button
                  onClick={() => handleDrawerNavigate('discover')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary-container">explore</span>
                  <span>Eksplorasi (Discover)</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('seeker')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-blue-500">person_search</span>
                  <span>Pencari (Seeker)</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('finder')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-500">inventory_2</span>
                  <span>Penemu (Finder)</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('search')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary-container">search</span>
                  <span>Pencarian Cerdas N2L</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('global-chat')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-500">public</span>
                    <span>Global Chat Komunitas</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-orange-500 text-white">LIVE</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('messages', true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-amber-500">forum</span>
                    <span>Pesan Pribadi</span>
                  </div>
                  {!isAuthenticated && (
                    <span className="material-symbols-outlined text-[14px] text-muted-text">lock</span>
                  )}
                </button>

                <div className="my-2 border-t border-border-subtle/70 dark:border-dark-border" />

                <button
                  onClick={() => handleDrawerNavigate('profile', true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span>Profil Warga</span>
                  </div>
                  {!isAuthenticated && (
                    <span className="material-symbols-outlined text-[14px] text-muted-text">lock</span>
                  )}
                </button>
                <button
                  onClick={() => handleDrawerNavigate('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  <span>Pengaturan</span>
                </button>
                <button
                  onClick={() => handleDrawerNavigate('support')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-surface-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-tertiary-container">help</span>
                  <span>Pusat Bantuan</span>
                </button>
              </div>
            </div>

            {/* Bottom of Drawer: Logout if auth */}
            {isAuthenticated && (
              <div className="pt-3 border-t border-border-subtle dark:border-dark-border">
                <button
                  onClick={async () => {
                    setIsDrawerOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs text-error-destructive font-semibold hover:bg-error-destructive/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar with elevated circular + Lapor FAB */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30">
        <nav className="glass-header-premium bg-surface-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border border-border-subtle/80 dark:border-white/10 rounded-2xl flex items-center justify-around h-16 px-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          {bottomItems.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={handleFabClick}
                  className="w-13 h-13 -mt-6 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all ring-4 ring-surface-white dark:ring-dark-surface"
                  title="Buat Laporan Baru"
                >
                  <span className="material-symbols-outlined text-[26px]">add</span>
                </button>
              );
            }

            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleBottomItemClick(item)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs transition-all relative ${
                  isActive
                    ? 'text-primary-container font-semibold'
                    : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-primary-container shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
