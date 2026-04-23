'use client';
import PendingEvents from './index';
import { usePendingEvents } from '@/hooks/features/list-event-for-admin/usePendingEvents';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  colorVariant?: 'admin' | 'organizer';
  apiBaseUrl?: string;
}

export default function PendingEventsContainer({
  user,
  userDetails,
  colorVariant,
  apiBaseUrl
}: Props) {
  const { data, isLoading, error } = usePendingEvents({ baseUrl: apiBaseUrl });
  return (
    <PendingEvents
      user={user}
      userDetails={userDetails}
      colorVariant={colorVariant}
      externalData={data}
      externalIsLoading={isLoading}
      externalError={error}
      badgeFromStatus={colorVariant === 'admin'}
    />
  );
}
