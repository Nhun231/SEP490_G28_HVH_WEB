'use client';

import PendingEventDetailContainer from '@/components/dashboard/pending-events/detail-container';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RunningEventDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/dashboard/running-events');
      return;
    }

    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/dashboard/signin');
        return;
      }

      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      setUser(user);
      setUserDetails(userDetails);
    };

    fetchUserData();
  }, [id, supabase, router]);

  return (
    <PendingEventDetailContainer
      user={user}
      userDetails={userDetails}
      id={id ?? ''}
      backBasePath="/dashboard/running-events"
      pageDescription="Thông tin chi tiết sự kiện đang diễn ra"
    />
  );
}
