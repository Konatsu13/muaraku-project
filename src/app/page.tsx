'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DiscoverFeed } from '../views/DiscoverFeed';
import { useModals } from '../context/ModalContext';
import { Report } from '../types';

export default function HomePage() {
  const router = useRouter();
  const { openClaimModal, openReportModal } = useModals();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return (
    <DiscoverFeed
      onSelectReport={handleSelectReport}
      onOpenClaimModal={openClaimModal}
      onOpenReportModal={openReportModal}
    />
  );
}
