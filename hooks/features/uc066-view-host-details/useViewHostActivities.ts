import type { HostActivitiesListResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id?: string;
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useViewHostActivities = ({
  id,
  pageNumber = 0,
  pageSize = 10,
  fromDate,
  toDate,
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    const trimmedId = id?.trim();
    if (!enabled || !trimmedId) return null;

    const effectiveFromDate = fromDate?.trim() || '1900-01-01';
    const effectiveToDate = toDate?.trim() || '2999-12-31';

    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize),
      fromDate: effectiveFromDate,
      toDate: effectiveToDate
    });

    const path = `/org-manager/hosts/${trimmedId}/activities?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, id, pageNumber, pageSize, fromDate, toDate]);

  return useSWR<HostActivitiesListResponse>(url);
};
