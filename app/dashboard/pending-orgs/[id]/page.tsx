'use client';

import PendingOrgDetailContainer from '@/components/dashboard/pending-orgs/detail-container';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PendingOrgDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/dashboard/pending-orgs');
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
    <PendingOrgDetailContainer
      user={user}
      userDetails={userDetails}
      id={id ?? ''}
    />
  );
}
