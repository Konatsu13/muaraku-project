"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppBottomNav } from "@/components/layout/AppBottomNav";
import { MuaraAIChatWidget } from "@/components/ai/MuaraAIChatWidget";
import { ReportModal } from "@/components/reports/ReportModal";
import { SettingsOverlay } from "@/components/overlays/SettingsOverlay";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, openAuthModal } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<"lost" | "found">("lost");
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal("login");
      router.replace(`/?auth=login&next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname, openAuthModal]);

  const handleOpenReportModal = (type: "lost" | "found" = "lost") => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 p-2 border border-orange-500/20">
          <Image
            src="/logo.svg"
            alt="MuaraKu Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span>Memuat sesi MuaraKu...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-canvas dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Desktop Sidebar */}
      <AppSidebar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <AppHeader
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenReportModal={handleOpenReportModal}
        />

        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
        >
          <div className="max-w-[1440px] w-full mx-auto">{children}</div>
        </main>

        {/* Mobile main-menu navigation — in flow so it is visible immediately */}
        <AppBottomNav />
      </div>

      {/* Global AI Assistant Floating Widget */}
      <MuaraAIChatWidget />

      {/* Global Report Filing Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType={reportModalType}
      />

      {/* Settings Overlay (shared by sidebar and mobile header) */}
      <SettingsOverlay isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
