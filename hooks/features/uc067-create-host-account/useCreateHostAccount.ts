import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type { CreateHostAccountRequest } from '@/hooks/dto/host';

interface Params {
  baseUrl?: string;
}

export const useCreateHostAccount = ({ baseUrl = '' }: Params = {}) => {
  const path = '/org-manager/hosts';
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<any, Error, string, CreateHostAccountRequest>(
    url,
    (url, { arg }) =>
      swrFetcher(url, {
        method: 'POST',
        body: JSON.stringify(arg),
        headers: {
          'Content-Type': 'application/json'
        }
      })
  );
};
