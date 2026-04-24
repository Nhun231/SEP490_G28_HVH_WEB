'use client';

import PendingOrgs from '@/components/dashboard/pending-orgs';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingOrgsPage() {
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

  return <PendingOrgs user={user} userDetails={userDetails} />;
}
