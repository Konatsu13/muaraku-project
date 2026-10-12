"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MuaraAIChatWidget } from "@/components/ai/MuaraAIChatWidget";
import { ReportModal } from "@/components/reports/ReportModal";
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<"lost" | "found">("lost");

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100">
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
