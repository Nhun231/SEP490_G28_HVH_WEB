'use client';

import PendingEventDetail from '@/components/dashboard/pending-events/detail';
import { useViewEventDetailsBySysAdmin } from '@/hooks/features/sys-admin/view-event-details-by-system-admin/useViewEventDetailsBySysAdmin';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  id: string;
}

export default function HostEventDetailContainer({
  user,
  userDetails,
  id
}: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const {
    data,
    error,
    isLoading,
    mutate: refetchEventDetails
  } = useViewEventDetailsBySysAdmin({
    id,
    baseUrl: apiBaseUrl
  });

  return (
    <PendingEventDetail
      user={user}
      userDetails={userDetails}
      externalData={data}
      externalIsLoading={isLoading}
      externalError={error}
      onRefetchEventDetails={() => refetchEventDetails()}
      backBasePath="/dashboard/organizers-list"
      pageDescription="Thông tin sự kiện từ lịch sử hoạt động của host"
      infoText="Thông tin sự kiện từ lịch sử hoạt động của host"
      showActions={false}
      showApprovedActions={false}
      showHostInfo={false}
    />
  );
}
