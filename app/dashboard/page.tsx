'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const redirectToTarget = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/dashboard/signin');
        return;
      }

      router.replace('/dashboard/main');
    };

    redirectToTarget();
  }, [supabase, router]);

  return <div className="p-6 text-zinc-500">Đang chuyển hướng...</div>;
}
