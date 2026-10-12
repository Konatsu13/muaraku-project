'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SeekerPage } from '../../views/SeekerPage';
import { useModals } from '../../context/ModalContext';
import { Report } from '../../types';

export default function SeekerRoute() {
  const router = useRouter();
  const { openClaimModal, openReportModal } = useModals();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return (
    <SeekerPage
      onSelectReport={handleSelectReport}
      onOpenReportModal={openReportModal}
      onOpenClaimModal={openClaimModal}
    />
  );
}
