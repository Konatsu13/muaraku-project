'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '../../views/LoginPage';
import { useModals } from '../../context/ModalContext';

export default function LoginRoute() {
  const router = useRouter();
  const { openReportModal } = useModals();

  const handleNavigate = (route: string) => {
    if (route === 'discover' || route === 'home') {
      router.push('/');
    } else if (route.startsWith('/')) {
      router.push(route);
    } else {
      router.push(`/${route}`);
    }
  };

  return (
    <LoginPage
      onNavigate={handleNavigate}
      onOpenReportModal={openReportModal}
    />
  );
}
