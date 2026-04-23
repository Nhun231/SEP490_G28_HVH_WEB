import type { PendingEventsResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useRunningEvents = ({
  pageNumber = 0,
  pageSize = 100,
  name = '',
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const runningEventsUrl = useMemo(() => {
    if (!enabled) return null;

    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize)
    });

    if (name.trim() !== '') {
      queryParams.append('name', name.trim());
    }

    const path = `/sys-admin/events/running?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, name, pageNumber, pageSize]);

  return useSWR<PendingEventsResponse>(runningEventsUrl);
};
