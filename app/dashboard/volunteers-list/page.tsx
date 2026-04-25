'use client';

import VolunteersList from '@/components/dashboard/volunteers-list';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VolunteersListPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
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
  }, [supabase, router]);

  return <VolunteersList user={user} userDetails={null} />;
}
