'use client';

import PendingEvents from './index';
import { routes } from '@/components/routes';
import { useRunningEvents } from '@/hooks/features/list-event-for-admin/useRunningEvents';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  colorVariant?: 'admin' | 'organizer';
  apiBaseUrl?: string;
}

export default function RunningEventsContainer({
  user,
  userDetails,
  colorVariant,
  apiBaseUrl
}: Props) {
  const { data, isLoading, error } = useRunningEvents({ baseUrl: apiBaseUrl });

  return (
    <PendingEvents
      user={user}
      userDetails={userDetails}
      detailBasePath="/dashboard/running-events"
      routes={routes}
      colorVariant={colorVariant}
      externalData={data}
      externalIsLoading={isLoading}
      externalError={error}
      pageTitle="Quản lý sự kiện"
      pageDescription="Danh sách các sự kiện đang diễn ra"
      emptyStateText="Không có sự kiện đang diễn ra"
      topHelperText="Quản lý các sự kiện đang diễn ra trên toàn hệ thống"
      badgeFromStatus={true}
    />
  );
}
