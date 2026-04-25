'use client';

import ApprovedEventDetailContainer from '@/components/dashboard/approved-events/detail-container';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrganizerApprovedEventDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/organizer/approved-events');
      return;
    }

    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(userData.user as any);
    };

    fetchUserData();
  }, [id, supabase, router]);

  return (
    <ApprovedEventDetailContainer
      user={user}
      userDetails={null}
      id={id ?? ''}
      routes={organizerRoutes}
      colorVariant="organizer"
    />
  );
}
