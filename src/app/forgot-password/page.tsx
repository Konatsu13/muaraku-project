'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPasswordPage } from '../../views/ForgotPasswordPage';

export default function ForgotPasswordRoute() {
  const router = useRouter();

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
    <ForgotPasswordPage onNavigate={handleNavigate} />
  );
}
