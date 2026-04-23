import type { SystemStatsResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  baseUrl?: string;
  enabled?: boolean;
}

export const useGetStatistic = ({
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    if (!enabled) return null;

    const path = '/sys-admin/sys-stats';
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled]);

  return useSWR<SystemStatsResponse>(url);
};
