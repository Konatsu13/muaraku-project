'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FinderPage } from '../../views/FinderPage';
import { useModals } from '../../context/ModalContext';
import { Report } from '../../types';

export default function FinderRoute() {
  const router = useRouter();
  const { openReportModal } = useModals();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  const handleOpenChatWithClaimant = () => {
    router.push('/messages');
  };

  return (
    <FinderPage
      onSelectReport={handleSelectReport}
      onOpenReportModal={openReportModal}
      onOpenChatWithClaimant={handleOpenChatWithClaimant}
    />
  );
}
