'use client';

import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/sonner';

const NotificationManager = dynamic(
  () => import('@/components/NotificationManager'),
  { ssr: false }
);

export default function AppClientServices() {
  return (
    <>
      <NotificationManager />
      <Toaster />
    </>
  );
}
