import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import { RejectEventRequest } from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useRejectEventByOrgManager = ({ id, baseUrl = '' }: Params) => {
  const path = `/org-manager/event/${id}/reject`;
  const url = id ? (baseUrl ? `${baseUrl}${path}` : path) : null;
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
