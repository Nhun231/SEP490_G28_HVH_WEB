'use client';

import PendingEventDetail from '@/components/dashboard/pending-events/detail';
import { organizerRoutes } from '@/components/routes';
import { useViewPendingEventDetailsByOrgManager } from '@/hooks/features/uc090-view-pending-event-details-by-org-manager/useViewPendingEventDetailsByOrgManger';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrganizerPendingEventDetailPage() {
  const supabase = createClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError
  } = useViewPendingEventDetailsByOrgManager({
    id: id ?? '',
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!
  });

  useEffect(() => {
    if (!id) {
      router.push('/organizer/pending-events');
      return;
    }

    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/signin/password_signin');
        return;
      }
      const { data: userDetailsData } = await supabase
        .from('user_details')
        .select('*')
        .single();
      setUser(userData.user as any);
      setUserDetails(userDetailsData as any);
    };

    fetchUserData();
  }, [id, supabase, router]);

  return (
    <PendingEventDetail
      user={user}
      userDetails={userDetails}
      eventId={id ?? ''}
      backBasePath="/organizer/pending-events"
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
      externalData={eventData}
      externalIsLoading={isEventLoading}
      externalError={eventError ?? null}
    />
  );
}
