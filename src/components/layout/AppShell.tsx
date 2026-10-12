'use client';

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AuthModal } from '../modals/AuthModal';
import { ReportModal } from '../modals/ReportModal';
import { ClaimModal } from '../modals/ClaimModal';
import { ModerationModal } from '../modals/ModerationModal';
import { MuaraAiAssistant } from '../ai/MuaraAiAssistant';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const {
    isReportModalOpen,
    closeReportModal,
    openReportModal,
    claimTargetReport,
    closeClaimModal,
    moderationTarget,
    closeModerationModal,
  } = useModals();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Compute current route string matching existing route names
  const currentRoute = useMemo(() => {
    if (!pathname || pathname === '/' || pathname === '/discover') return 'discover';
    if (pathname.startsWith('/seeker')) return 'seeker';
    if (pathname.startsWith('/finder')) return 'finder';
    if (pathname.startsWith('/search')) return 'search';
    if (pathname.startsWith('/report')) return 'detail';
    if (pathname.startsWith('/login')) return 'login';
    if (pathname.startsWith('/signup')) return 'signup';
    if (pathname.startsWith('/forgot-password')) return 'forgot-password';
    if (pathname.startsWith('/profile')) return 'profile';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/global-chat')) return 'global-chat';
    if (pathname.startsWith('/messages')) return 'messages';
    if (pathname.startsWith('/support')) return 'support';
    if (pathname.startsWith('/admin')) return 'admin';
    return 'discover';
  }, [pathname]);

  const isAuthPage = PUBLIC_ROUTES.includes(pathname || '');

  // Enforce mandatory authentication redirect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.push('/login');
      } else if (isAuthenticated && isAuthPage) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, isAuthPage, router]);

  const handleNavigate = (route: string) => {
    if (route === 'discover' || route === 'home') {
      router.push('/');
    } else if (route.startsWith('/')) {
      router.push(route);
    } else {
      router.push(`/${route}`);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // 1. Sleek Apple-inspired loading splash screen during initial session verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-80 dark:opacity-40" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-0 rounded-full bg-orange-400/15 blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 flex items-center justify-center p-2.5 shadow-glow-orange ring-1 ring-white/30 animate-bounce">
            <img src="/logo.svg" alt="MuaraKu" className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-on-surface dark:text-white">
              Muara<span className="text-primary-container">Ku</span>
            </h1>
            <p className="text-xs text-muted-text font-medium tracking-wide">
              Memverifikasi sesi aman Supabase...
            </p>
          </div>
          <div className="w-36 h-1 rounded-full bg-surface-container-high dark:bg-dark-surface overflow-hidden">
            <div className="h-full bg-primary-container rounded-full animate-shimmer" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Auth pages (Login, Signup, Forgot Password): Render clean form without app chrome
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-80 dark:opacity-40" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern bg-grid-fade opacity-[0.45] dark:opacity-[0.25]" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-70" aria-hidden="true" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] animate-breathe" aria-hidden="true" />
        <div className="fixed -top-40 right-[-100px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-orange-400/15 dark:bg-orange-500/12 blur-3xl" aria-hidden="true" />
        <div className="fixed top-1/2 left-[-150px] w-[600px] h-[600px] pointer-events-none z-0 rounded-full bg-amber-400/12 dark:bg-amber-600/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // 3. Authenticated App Shell
  return (
    <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-75 dark:opacity-35" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern bg-grid-fade opacity-[0.45] dark:opacity-[0.25]" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-70" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.16),transparent_70%)] animate-breathe" aria-hidden="true" />
      <div className="fixed -top-40 right-[-100px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-orange-400/15 dark:bg-orange-500/12 blur-3xl" aria-hidden="true" />
      <div className="fixed top-1/2 left-[-150px] w-[600px] h-[600px] pointer-events-none z-0 rounded-full bg-amber-400/12 dark:bg-amber-600/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenReportModal={openReportModal}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-16 md:pb-0 ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-60'
          }`}
        >
          <Header
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onSearchSubmit={handleSearchSubmit}
            onOpenReportModal={openReportModal}
          />

          <MobileNav
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenReportModal={openReportModal}
          />

          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>

        {/* Global Modals */}
        <AuthModal />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          onReportCreated={() => {
            closeReportModal();
            router.push('/');
          }}
        />

        <ClaimModal
          report={claimTargetReport}
          isOpen={Boolean(claimTargetReport)}
          onClose={closeClaimModal}
          onClaimSubmitted={() => {
            closeClaimModal();
            router.push('/finder');
          }}
          onOpenChatWithFinder={() => {
            closeClaimModal();
            router.push('/messages');
          }}
        />

        <ModerationModal
          isOpen={Boolean(moderationTarget)}
          onClose={closeModerationModal}
          targetType={moderationTarget?.type || 'report'}
          targetId={moderationTarget?.id || ''}
          targetTitle={moderationTarget?.title}
        />

        {/* Intelligent Floating Muara AI Assistant */}
        <MuaraAiAssistant onNavigate={handleNavigate} />
      </div>
    </div>
  );
};
