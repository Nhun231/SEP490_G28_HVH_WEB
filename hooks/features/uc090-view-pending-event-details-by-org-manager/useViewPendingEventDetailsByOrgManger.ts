import type { EventDetailsResponseForManager } from '@/hooks/dto';
import useSWR from 'swr';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useViewPendingEventDetailsByOrgManager = ({
  id,
  baseUrl = ''
}: Params) => {
  const path = `/manager/event/event-details/${id}`;
  const url = id ? (baseUrl ? `${baseUrl}${path}` : path) : null;

  return useSWR<EventDetailsResponseForManager>(url);
};
