import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useApproveEventByAdmin = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/events/${id}/approve`;
  const url = id ? (baseUrl ? `${baseUrl}${path}` : path) : null;
  return useSWRMutation(url, (url) =>
    swrFetcher(url, {
      method: 'PUT'
    })
  );
};
