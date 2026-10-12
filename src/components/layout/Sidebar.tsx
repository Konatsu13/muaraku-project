'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenReportModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  onOpenReportModal,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser, isAuthenticated, logout, openAuthModal, setTargetRedirect } = useAuth();

  const handleProtectedNavigate = (routeId: string) => {
    if (!isAuthenticated) {
      setTargetRedirect?.(routeId);
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onNavigate(routeId);
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setTargetRedirect?.('report');
      openAuthModal?.('login');
      onNavigate('login');
      return;
    }
    onOpenReportModal();
  };

  const navItems = [
    { id: 'discover', label: 'Eksplorasi', icon: 'explore', requiresAuth: false },
    { id: 'seeker', label: 'Pencari (Seeker)', icon: 'person_search', requiresAuth: false },
    { id: 'finder', label: 'Penemu (Finder)', icon: 'inventory_2', requiresAuth: false },
    { id: 'search', label: 'Cari Barang (N2L)', icon: 'search', requiresAuth: false },
    { id: 'global-chat', label: 'Global Chat', icon: 'public', badge: 'LIVE', requiresAuth: false },
    { id: 'messages', label: 'Pesan Masuk', icon: 'forum', badge: '1', requiresAuth: true },
  ];

  const secondaryNavItems = [
    { id: 'profile', label: 'Profil Warga', icon: 'person', requiresAuth: true },
    { id: 'settings', label: 'Pengaturan', icon: 'settings', requiresAuth: false },
    { id: 'support', label: 'Pusat Bantuan', icon: 'help', requiresAuth: false },
  ];

  const isAdminOrStaff = isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'staff');

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
    <aside
      className={`fixed top-0 left-0 h-screen z-30 bg-surface-white/80 dark:bg-dark-surface/85 backdrop-blur-2xl border-r border-border-subtle/70 dark:border-dark-border/60 glass-header-premium flex flex-col justify-between transition-all duration-300 select-none shadow-[4px_0_24px_-4px_rgba(24,24,27,0.02)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)] ${
        isCollapsed ? 'w-20 p-2.5' : 'w-60 p-4'
      }`}
    >
      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
        {/* Brand Lockup */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1 pt-1`}>
          <button
            onClick={() => onNavigate('discover')}
            className="flex items-center gap-2.5 text-left group min-w-0"
            title="Kembali ke Eksplorasi"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm p-1.5">
              <img src="/logo.svg" alt="MuaraKu" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[16px] font-bold text-on-surface dark:text-surface-white tracking-tight leading-tight truncate">
                  MuaraKu
                </span>
                <span className="text-[11px] text-primary-container font-medium leading-none">Lost & Found Sipil</span>
              </div>
            )}
          </button>

          {/* Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle/70 dark:border-dark-border text-muted-text hover:text-on-surface dark:hover:text-surface-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
              title="Ciutkan sidebar"
            >
              <span className="material-symbols-outlined text-[16px]">menu_open</span>
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center pt-1">
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle/70 dark:border-dark-border text-muted-text hover:text-on-surface dark:hover:text-surface-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
              title="Perluas sidebar"
            >
              <span className="material-symbols-outlined text-[16px]">menu</span>
            </button>
          </div>
        )}

        {/* Authenticated User Info Preview with Karma Points */}
        {isAuthenticated && currentUser && (
          <div
            onClick={() => onNavigate('profile')}
            className={`cursor-pointer rounded-2xl glass-surface border border-border-subtle/70 dark:border-white/10 p-2.5 transition-all hover:border-primary-container/40 ${
              isCollapsed ? 'flex justify-center p-2' : 'flex items-center gap-2.5'
            }`}
            title="Buka Profil Warga"
          >
            <div className="relative shrink-0">
              <img
                src={
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                }
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary-container/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-white dark:ring-dark-surface" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface dark:text-surface-white truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-primary-container font-semibold truncate">
                    {getRoleLabel(currentUser.role)}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                    ⭐ {currentUser.civic_karma !== undefined ? currentUser.civic_karma : 120}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Lapor Barang */}
        <button
          onClick={handleReportClick}
          className={`h-11 btn-premium text-white font-label-md text-label-md font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all ${
            isCollapsed ? 'w-11 px-0 mx-auto' : 'w-full px-3'
          }`}
          title="Buat Laporan Baru"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          {!isCollapsed && <span>+ Lapor Barang</span>}
        </button>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold text-muted-text tracking-wider uppercase">
              Menu Utama
            </div>
          )}
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  item.requiresAuth ? handleProtectedNavigate(item.id) : onNavigate(item.id)
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-label-md text-label-md transition-all active:scale-98 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-primary-container font-semibold border-l-4 border-primary-container shadow-xs'
                    : 'text-secondary-ink dark:text-muted-text hover:bg-black/5 dark:hover:bg-white/5 hover:text-on-surface dark:hover:text-surface-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span
                  className="material-symbols-outlined text-[20px] shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.requiresAuth && !isAuthenticated && (
                        <span className="material-symbols-outlined text-[14px] text-muted-text" title="Perlu Login">
                          lock
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            item.badge === 'LIVE'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                              : 'bg-soft-surface dark:bg-dark-border text-secondary-ink dark:text-muted-text border border-border-subtle/80 dark:border-dark-border'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-2 border-t border-border-subtle/70 dark:border-dark-border/70" />

          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold text-muted-text tracking-wider uppercase">
              Bantuan & Akun
            </div>
          )}

          {secondaryNavItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  item.requiresAuth ? handleProtectedNavigate(item.id) : onNavigate(item.id)
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-label-md text-label-md transition-all active:scale-98 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-primary-container font-semibold border-l-4 border-primary-container shadow-xs'
                    : 'text-secondary-ink dark:text-muted-text hover:bg-black/5 dark:hover:bg-white/5 hover:text-on-surface dark:hover:text-surface-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span
                  className="material-symbols-outlined text-[20px] shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.requiresAuth && !isAuthenticated && (
                      <span className="material-symbols-outlined text-[14px] text-muted-text" title="Perlu Login">
                        lock
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Admin Navigation (Staff or Admin) */}
          {isAdminOrStaff && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-label-md text-label-md transition-all active:scale-98 relative ${
                currentRoute === 'admin'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border-l-4 border-amber-500 shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? 'Dashboard Admin' : undefined}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">admin_panel_settings</span>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate font-semibold">Moderasi & Petugas</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-3 border-t border-border-subtle/70 dark:border-dark-border/70 flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => onNavigate('support')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-secondary-ink dark:text-muted-text font-label-md text-label-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Bantuan Petugas"
        >
          <span className="material-symbols-outlined text-[20px] text-tertiary-container">verified_user</span>
          {!isCollapsed && <span>Bantuan Petugas</span>}
        </button>

        {isAuthenticated ? (
          <button
            onClick={() => logout()}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-error-destructive font-label-md text-xs font-semibold hover:bg-error-destructive/10 transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Keluar"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!isCollapsed && <span>Keluar</span>}
          </button>
        ) : (
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={() => onNavigate('login')}
              className={`h-9 px-3 rounded-xl border border-border-subtle dark:border-dark-border text-xs font-semibold text-on-surface dark:text-surface-white hover:border-primary-container/40 hover:text-primary-container transition-all flex items-center gap-2 ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Masuk"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              {!isCollapsed && <span>Masuk</span>}
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className={`h-9 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-2 ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Daftar Akun"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              {!isCollapsed && <span>Daftar Akun</span>}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
