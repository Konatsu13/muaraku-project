'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ReportDetailPage } from '../../../views/ReportDetailPage';
import { useModals } from '../../../context/ModalContext';
import { db } from '../../../lib/supabase';
import { Report } from '../../../types';

export default function ReportDetailRoute() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;
  const { openClaimModal, openModerationModal } = useModals();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      if (!reportId) return;
      try {
        setLoading(true);
        const allReports = await db.getReports();
        const found = allReports.find((r) => r.id === reportId);
        if (found) {
          setReport(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-text font-medium">Memuat detail laporan #{reportId}...</p>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Laporan Tidak Ditemukan</h2>
        <p className="text-muted-text text-sm mb-6">
          Laporan dengan ID tersebut mungkin sudah dihapus atau tidak tersedia.
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-premium px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-glow-orange"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <ReportDetailPage
      report={report}
      onBack={() => router.push('/')}
      onOpenClaimModal={openClaimModal}
      onOpenChatWithReporter={() => router.push('/messages')}
      onOpenModerationModal={(r) =>
        openModerationModal({ type: 'report', id: r.id, title: r.title })
      }
      onReportUpdated={() => router.push('/')}
    />
  );
}
