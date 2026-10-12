'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardPage } from '../../views/AdminDashboardPage';
import { Report } from '../../types';

export default function AdminRoute() {
  const router = useRouter();

  const handleSelectReport = (report: Report) => {
    router.push(`/report/${report.id}`);
  };

  return <AdminDashboardPage onSelectReport={handleSelectReport} />;
}
