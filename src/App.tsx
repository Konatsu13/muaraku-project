import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { AuthModal } from './components/modals/AuthModal';
import { ReportModal } from './components/modals/ReportModal';
import { ClaimModal } from './components/modals/ClaimModal';
import { ModerationModal } from './components/modals/ModerationModal';
import { MuaraAiAssistant } from './components/ai/MuaraAiAssistant';

// Pages
import { DiscoverFeed } from './pages/DiscoverFeed';
import { SeekerPage } from './pages/SeekerPage';
import { FinderPage } from './pages/FinderPage';
import { SearchPage } from './pages/SearchPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { GlobalChatPage } from './pages/GlobalChatPage';
import { PrivateMessagesPage } from './pages/PrivateMessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { Report } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('discover');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Modals State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [claimTargetReport, setClaimTargetReport] = useState<Report | null>(null);
  const [moderationTarget, setModerationTarget] = useState<{
    type: 'report' | 'user' | 'message';
    id: string;
    title?: string;
  } | null>(null);

  // Enforce Protected Routes: Redirect unauthenticated users immediately to login
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (currentRoute !== 'login' && currentRoute !== 'signup' && currentRoute !== 'forgot-password') {
          setCurrentRoute('login');
        }
      } else {
        if (currentRoute === 'login' || currentRoute === 'signup' || currentRoute === 'forgot-password') {
          setCurrentRoute('discover');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentRoute]);

  // Navigation handler
  const handleNavigate = (route: string) => {
    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && route !== 'login' && route !== 'signup' && route !== 'forgot-password') {
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportDetail = (report: Report) => {
    setSelectedReport(report);
    setCurrentRoute('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenClaimModal = (report: Report) => {
    setClaimTargetReport(report);
  };

  const handleSearchSubmitFromHeader = (query: string) => {
    setSearchInitialQuery(query);
    setCurrentRoute('search');
  };

  const handleOpenChatWithReporter = (_report: Report) => {
    setCurrentRoute('messages');
  };

  // 1. Sleek Apple-inspired loading splash screen during initial session verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-80 dark:opacity-40" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-0 rounded-full bg-orange-400/15 blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 ring-4 ring-white/60 dark:ring-white/10 animate-pulse">
            <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
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
          <div className="space-y-1">
            <h1 className="font-headline-md text-xl font-bold tracking-tight text-on-surface dark:text-surface-white">
              MuaraKu
            </h1>
            <p className="text-xs text-muted-text font-medium flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>Memeriksa Sesi Pengguna...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. MANDATORY AUTHENTICATION: If user is not authenticated, ONLY allow auth routes
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white relative overflow-x-hidden">
        {/* Apple, Linear & Modern SaaS Multi-Layer Ambient Canvas */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-80 dark:opacity-40" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern bg-grid-fade opacity-[0.45] dark:opacity-[0.25]" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-70" aria-hidden="true" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] animate-breathe" aria-hidden="true" />
        <div className="fixed -top-40 right-[-100px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-orange-400/15 dark:bg-orange-500/12 blur-3xl" aria-hidden="true" />
        <div className="fixed top-1/2 left-[-150px] w-[600px] h-[600px] pointer-events-none z-0 rounded-full bg-amber-400/12 dark:bg-amber-600/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10">
          {currentRoute === 'signup' ? (
            <SignupPage onNavigate={handleNavigate} />
          ) : currentRoute === 'forgot-password' ? (
            <ForgotPasswordPage onNavigate={handleNavigate} />
          ) : (
            <LoginPage
              onNavigate={handleNavigate}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}
        </div>
      </div>
    );
  }

  // 3. AUTHENTICATED USER SHELL & MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-premium-canvas text-on-surface dark:text-surface-white flex flex-col relative overflow-x-hidden">
      {/* Apple, Linear & Modern SaaS Multi-Layer Ambient Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-mesh-gradient opacity-75 dark:opacity-35" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern bg-grid-fade opacity-[0.45] dark:opacity-[0.25]" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-70" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.16),transparent_70%)] animate-breathe" aria-hidden="true" />
      <div className="fixed -top-40 right-[-100px] w-[550px] h-[550px] pointer-events-none z-0 rounded-full bg-orange-400/15 dark:bg-orange-500/12 blur-3xl" aria-hidden="true" />
      <div className="fixed top-1/2 left-[-150px] w-[600px] h-[600px] pointer-events-none z-0 rounded-full bg-amber-400/12 dark:bg-amber-600/10 blur-3xl" aria-hidden="true" />

      {/* Main Content Shell with elevated z-index */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main Content Area (Offset by sidebar width on desktop) */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-16 md:pb-0 ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-60'
          }`}
        >
          {/* Top App Header with Frosted Glassmorphism */}
          <Header
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onSearchSubmit={handleSearchSubmitFromHeader}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />

          {/* Mobile Top & Bottom Navigation (< 768px) */}
          <MobileNav
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />

          {/* Main View Router */}
          <div className="flex-1 flex flex-col">
            {currentRoute === 'discover' && (
              <DiscoverFeed
                onSelectReport={handleOpenReportDetail}
                onOpenClaimModal={handleOpenClaimModal}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentRoute === 'seeker' && (
              <SeekerPage
                onSelectReport={handleOpenReportDetail}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onOpenClaimModal={handleOpenClaimModal}
              />
            )}

            {currentRoute === 'finder' && (
              <FinderPage
                onSelectReport={handleOpenReportDetail}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onOpenChatWithClaimant={() => setCurrentRoute('messages')}
              />
            )}

            {currentRoute === 'search' && (
              <SearchPage
                initialQuery={searchInitialQuery}
                onSelectReport={handleOpenReportDetail}
                onOpenClaimModal={handleOpenClaimModal}
              />
            )}

            {currentRoute === 'detail' && selectedReport && (
              <ReportDetailPage
                report={selectedReport}
                onBack={() => handleNavigate('discover')}
                onOpenClaimModal={handleOpenClaimModal}
                onOpenChatWithReporter={handleOpenChatWithReporter}
                onOpenModerationModal={(r) =>
                  setModerationTarget({ type: 'report', id: r.id, title: r.title })
                }
                onReportUpdated={() => {
                  handleNavigate('discover');
                }}
              />
            )}

            {currentRoute === 'global-chat' && (
              <GlobalChatPage
                onOpenModerationModal={(msgId) =>
                  setModerationTarget({ type: 'message', id: msgId })
                }
              />
            )}

            {currentRoute === 'messages' && (
              <PrivateMessagesPage
                onOpenModerationModal={(id) =>
                  setModerationTarget({ type: 'user', id })
                }
              />
            )}

            {currentRoute === 'profile' && (
              <ProfilePage
                onSelectReport={handleOpenReportDetail}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentRoute === 'settings' && <SettingsPage />}

            {currentRoute === 'support' && <SupportPage />}

            {currentRoute === 'admin' && (
              <AdminDashboardPage onSelectReport={handleOpenReportDetail} />
            )}
          </div>
        </div>

        {/* Global Modals */}
        <AuthModal />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onReportCreated={() => handleNavigate('discover')}
        />

        <ClaimModal
          report={claimTargetReport}
          isOpen={Boolean(claimTargetReport)}
          onClose={() => setClaimTargetReport(null)}
          onClaimSubmitted={() => {
            handleNavigate('finder');
          }}
          onOpenChatWithFinder={() => {
            setCurrentRoute('messages');
          }}
        />

        <ModerationModal
          isOpen={Boolean(moderationTarget)}
          onClose={() => setModerationTarget(null)}
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

export default App;
