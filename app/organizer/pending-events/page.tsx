'use client';

import PendingEvents from '@/components/dashboard/pending-events';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerPendingEventsPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: user } = await supabase.auth.getUser();
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
    <div>
      <PendingEvents
        user={user}
        userDetails={userDetails}
        detailBasePath="/organizer/pending-events"
        routes={organizerRoutes}
        colorVariant="organizer"
        signInPath="/signin/password_signin"
      />
    </div>
  );
}
