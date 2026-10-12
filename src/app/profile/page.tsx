'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfilePage } from '../../views/ProfilePage';
import { useModals } from '../../context/ModalContext';
import { Report } from '../../types';

export default function ProfileRoute() {
  const router = useRouter();
  const { openReportModal } = useModals();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return (
    <ProfilePage
      onSelectReport={handleSelectReport}
      onOpenReportModal={openReportModal}
    />
  );
}
