'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SignupPage } from '../../views/SignupPage';

export default function SignupRoute() {
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
    <SignupPage onNavigate={handleNavigate} />
  );
}
