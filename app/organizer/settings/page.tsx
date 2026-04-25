'use client';

import Settings from '@/components/dashboard/settings';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { organizerRoutes } from '@/components/routes';

export default function OrganizerSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(user);
    };

    fetchUserData();
  }, [supabase, router]);

  return (
    <Settings
      userDetails={null}
      user={user}
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    />
  );
}
