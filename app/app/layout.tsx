"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MuaraAIChatWidget } from "@/components/ai/MuaraAIChatWidget";
import { ReportModal } from "@/components/reports/ReportModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<"lost" | "found">("lost");

  const handleOpenReportModal = (type: "lost" | "found" = "lost") => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar Component */}
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onOpenReportModal={handleOpenReportModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenReportModal={handleOpenReportModal}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global AI Assistant Floating Widget */}
      <MuaraAIChatWidget />

      {/* Global Report Filing Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultType={reportModalType}
      />
    </div>
  );
}
