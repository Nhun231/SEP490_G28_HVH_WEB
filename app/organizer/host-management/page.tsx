'use client';

import OrganizerHostManagement from '@/components/dashboard/organizer-host-management';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function OrganizerHostManagementPage() {
  const [supabase] = useState(createClient);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/signin/password_signin');
          return;
        }

        if (!isMounted) return;

        setUser(user);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  return (
    <OrganizerHostManagement
      user={user}
      userDetails={null}
      isAuthLoading={isAuthLoading}
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    />
  );
}
