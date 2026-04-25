'use client';

import PendingEventDetailContainer from '@/components/dashboard/pending-events/detail-container';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PendingEventDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/dashboard/pending-events');
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

      setUser(user);
    };

    fetchUserData();
  }, [id, supabase, router]);

  return (
    <PendingEventDetailContainer
      user={user}
      userDetails={null}
      id={id ?? ''}
    />
  );
}
