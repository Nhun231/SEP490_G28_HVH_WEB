'use client';

import OrganizerHostManagement from '@/components/dashboard/organizer-host-management';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerHostManagementPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      if (!user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(user);
      setUserDetails(userDetails);
    };

    fetchUserData();
  }, [supabase, router]);

  return (
    <OrganizerHostManagement
      user={user}
      userDetails={userDetails}
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    />
  );
}
