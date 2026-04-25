import type { OrganizationCountHostsAndEventsResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  baseUrl?: string;
  enabled?: boolean;
}

export const useCountHostAndEvents = ({
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    if (!enabled) return null;

    const path = '/org-manager/org-stats/count-hosts-events';
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled]);

  return useSWR<OrganizationCountHostsAndEventsResponse>(url);
};
