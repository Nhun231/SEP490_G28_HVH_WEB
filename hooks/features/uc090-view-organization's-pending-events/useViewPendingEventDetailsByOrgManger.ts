import type { EventDetailsResponseForManager } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useViewPendingEventDetailsByOrgManager = ({
  id,
  baseUrl = ''
}: Params) => {
  const url = useMemo(() => {
    const path = `/org-manager/events/event-details/${id}`;
    return id ? (baseUrl ? `${baseUrl}${path}` : path) : null;
  }, [id, baseUrl]);

  return useSWR<EventDetailsResponseForManager>(url);
};
