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

      setUser(user);
    };

    fetchUserData();
  }, [id, supabase, router]);

  return (
    <OrganizationEditPage
      orgId={id ?? ''}
      user={user}
      userDetails={null}
    />
  );
}
