'use client';

import RunningEventsContainer from '@/components/dashboard/pending-events/RunningEventsContainer';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RunningEventsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/dashboard/signin');
        return;
      }

      setUser(user);
    };

    fetchUserData();
  }, [supabase, router]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <RunningEventsContainer
      user={user}
      userDetails={null}
      colorVariant="admin"
      apiBaseUrl={apiBaseUrl}
    />
  );
}
