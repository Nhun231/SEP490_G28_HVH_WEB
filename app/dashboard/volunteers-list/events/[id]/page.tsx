'use client';

import VolunteerEventDetailContainer from '@/components/dashboard/volunteers-list/event-detail-container';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VolunteerEventDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/dashboard/volunteers-list');
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
    <VolunteerEventDetailContainer
      user={user}
      userDetails={null}
      id={id ?? ''}
    />
  );
}
