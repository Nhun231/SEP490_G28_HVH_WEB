'use client';

import PendingEvents from '@/components/dashboard/pending-events';
import { organizerRoutes } from '@/components/routes';
import { usePendingEventsList } from "@/hooks/features/uc089-view-organization's-pending-events/usePendingEventsList";
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerPendingEventsPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  const {
    data: pendingEventsData,
    isLoading: isPendingEventsLoading,
    error: pendingEventsError
  } = usePendingEventsList({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!
  });

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

  // Badge color mapping for each status
  const badgeClassNameByStatus = {
    EDITING: 'bg-gray-400 text-white hover:bg-gray-500',
    SUBMITTED: 'bg-blue-500 text-white hover:bg-blue-600',
    APPROVED_BY_MNG: 'bg-green-500 text-white hover:bg-green-600',
    REJECTED_BY_MNG: 'bg-red-400 text-white hover:bg-red-500',
    REJECTED_BY_AD: 'bg-red-700 text-white hover:bg-red-800',
    RECRUITING: 'bg-yellow-500 text-white hover:bg-yellow-600',
    UPCOMING: 'bg-indigo-500 text-white hover:bg-indigo-600',
    ONGOING: 'bg-orange-500 text-white hover:bg-orange-600',
    ENDED: 'bg-zinc-500 text-white hover:bg-zinc-600',
    COMPLETED: 'bg-green-700 text-white hover:bg-green-800',
    CANCELLED: 'bg-zinc-700 text-white hover:bg-zinc-800'
  };
  return (
    <div>
      <PendingEvents
        user={user}
        userDetails={userDetails}
        detailBasePath="/organizer/pending-events"
        routes={organizerRoutes}
        colorVariant="organizer"
        signInPath="/signin/password_signin"
        topHelperText="Quản lý các sự kiện đang chờ phê duyệt"
        externalData={pendingEventsData}
        externalIsLoading={isPendingEventsLoading}
        externalError={pendingEventsError ?? null}
        badgeFromStatus={true}
        badgeClassNameByStatus={badgeClassNameByStatus}
      />
    </div>
  );
}
