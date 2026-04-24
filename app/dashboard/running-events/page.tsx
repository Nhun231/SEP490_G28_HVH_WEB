'use client';

import RunningEventsContainer from '@/components/dashboard/pending-events/RunningEventsContainer';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RunningEventsPage() {
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
    <RunningEventsContainer
      user={user}
      userDetails={userDetails}
      colorVariant="admin"
      apiBaseUrl={apiBaseUrl}
    />
  );
}
