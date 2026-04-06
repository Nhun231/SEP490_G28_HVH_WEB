import type { EventDetailsResponseForSystemAdmin } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useViewEventDetailsBySysAdmin = ({ id, baseUrl = '' }: Params) => {
  const url = useMemo(() => {
    const path = `/sys-admin/events/event-details/${id}`;
    return id ? (baseUrl ? `${baseUrl}${path}` : path) : null;
  }, [id, baseUrl]);

  return useSWR<EventDetailsResponseForSystemAdmin>(url);
};
