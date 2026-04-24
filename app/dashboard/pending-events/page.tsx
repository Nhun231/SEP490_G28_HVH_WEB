'use client';

import PendingEvents from '@/components/dashboard/pending-events';
import PendingEventsContainer from '@/components/dashboard/pending-events/PendingEventsContainer';
import { usePendingEvents } from '@/hooks/features/sys-admin/list-event-for-admin/usePendingEvents';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingEventsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      if (!user) {
        router.push('/dashboard/signin');
        return;
      }

      setUser(user);
      setUserDetails(userDetails);
    };

    fetchUserData();
  }, [supabase, router]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return (
    <PendingEventsContainer
      user={user}
      userDetails={userDetails}
      colorVariant="admin"
      apiBaseUrl={apiBaseUrl}
    />
  );
}
