'use client';

import OrganizationEditPage from '@/components/dashboard/organizations/edit';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/dashboard/organizations');
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
    <OrganizationEditPage
      orgId={id ?? ''}
      user={user}
      userDetails={userDetails}
    />
  );
}
