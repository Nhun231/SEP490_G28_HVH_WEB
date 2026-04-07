import type { EventMomentFeedResponse } from '@/hooks/dto/eventMoment';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  pageNumber?: number;
  pageSize?: number;
  eventId?: string;
  baseUrl?: string;
}

export const useGetEventMomentsFeed = ({
  pageNumber = 0,
  pageSize = 10,
  eventId = '',
  baseUrl = ''
}: Params) => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize)
    });

    if (eventId.trim() !== '') {
      queryParams.append('eventId', eventId.trim());
    }

    const path = `/event-moments/feed?${queryParams.toString()}`;

    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, eventId, pageNumber, pageSize]);

  return useSWR<EventMomentFeedResponse>(url);
};
