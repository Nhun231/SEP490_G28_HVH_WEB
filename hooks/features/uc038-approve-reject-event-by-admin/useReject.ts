import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type { RejectEventRequest } from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useRejectEventByAdmin = ({ id, baseUrl = '' }: Params) => {
  const path = `/event/admin/${id}/reject`;
  const url = baseUrl ? `${baseUrl}${path}` : path;
  return useSWRMutation<void, Error, string, RejectEventRequest>(
    url,
    (url, { arg }) =>
      swrFetcher(url, {
        method: 'PUT',
        body: JSON.stringify(arg),
        headers: {
          'Content-Type': 'application/json'
        }
      })
  );
};
