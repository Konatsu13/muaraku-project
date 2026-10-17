"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { AuthModal } from "@/components/auth/AuthModal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
