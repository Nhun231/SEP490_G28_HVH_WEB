import type { PendingEventsResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  baseUrl?: string;
}

export const useApprovalEventsList = ({
  pageNumber = 0,
  pageSize = 10,
  name = '',
  baseUrl = ''
}: Params) => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize)
    });

    if (name.trim() !== '') {
      queryParams.append('name', name.trim());
    }

    const path = `/org-manager/event/approved?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, name, pageNumber, pageSize]);

  return useSWR<PendingEventsResponse>(url);
};
