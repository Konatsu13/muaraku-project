'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchPage } from '../../views/SearchPage';
import { useModals } from '../../context/ModalContext';
import { Report } from '../../types';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  const { openClaimModal } = useModals();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return (
    <SearchPage
      initialQuery={initialQuery}
      onSelectReport={handleSelectReport}
      onOpenClaimModal={openClaimModal}
    />
  );
}

export default function SearchRoute() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
