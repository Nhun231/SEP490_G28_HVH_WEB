import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import { CancelEventRequest } from '@/hooks/dto/event';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useCancelEventByAdmin = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/events/${id}/cancel`;
  const url = id ? (baseUrl ? `${baseUrl}${path}` : path) : null;
  return useSWRMutation(url, (url, { arg }: { arg: CancelEventRequest }) =>
    swrFetcher(url, {
      method: 'PUT',
      body: JSON.stringify(arg),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
};
