"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

export interface PublicReportPreview {
  id: string;
  report_type: "lost" | "found";
  title: string;
  city: string | null;
  location_label: string | null;
  occurred_at: string | null;
  created_at: string;
  category_name_id: string | null;
  category_name_en: string | null;
}

export function PublicReportFeed() {
  const { locale } = useI18n();
  const [reports, setReports] = useState<PublicReportPreview[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/public/reports");
        if (!mounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!mounted) return;
        setReports(json?.data ?? []);
      } catch (err) {
        if (!mounted) return;
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : "Gagal memuat laporan."
        );
        setReports(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  if (loading) {
    // Pola skeleton responsif — grid yang sama dengan grid feed aslinya.
    return <LoadingPattern count={6} />;
  }

  if (errorMsg) {
    return (
      <ErrorPattern
        title="Gagal memuat laporan"
        message={errorMsg}
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm text-secondary-text max-w-md mx-auto leading-relaxed">
          {locale === "en"
            ? "No approved community reports to show here yet."
            : "Belum ada laporan yang disetujui moderator untuk ditampilkan di sini."}
        </p>
        <Link href="/app">
          <Button variant="primary" size="md">
            {locale === "en" ? "Open MuaraKu" : "Buka MuaraKu"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((r) => {
        const isLost = r.report_type === "lost";
        const dateStr = (() => {
          try {
            return new Date(
              r.occurred_at || r.created_at
            ).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          } catch {
            return "-";
          }
        })();
        const place = [r.location_label, r.city].filter(Boolean).join(" · ");
        const categoryName =
          locale === "en"
            ? r.category_name_en || r.category_name_id
            : r.category_name_id || r.category_name_en;

        return (
          <article
            key={r.id}
            className="rounded-xl bg-surface p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge variant={isLost ? "lost" : "found"} size="sm">
                {isLost
                  ? locale === "en" ? "Lost" : "Hilang"
                  : locale === "en" ? "Found" : "Ditemukan"}
              </Badge>
              <span className="text-[11px] text-secondary-text">{dateStr}</span>
            </div>

            <Link
              href={`/app/reports/${r.id}`}
              className="block text-sm font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {r.title}
            </Link>

            <p className="text-xs text-secondary-text leading-relaxed">
              {[place, categoryName].filter(Boolean).join(" – ") || "—"}
            </p>
          </article>
        );
      })}
    </div>
  );
}
