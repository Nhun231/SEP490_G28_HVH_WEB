import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

export function useUnregisterToken(baseUrl?: string) {
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${apiBase}/notifications/unregister-token`;

  return useSWRMutation<any, Error, string, string>(
    url,
    (url, { arg: token }) =>
      swrFetcher(`${url}?token=${encodeURIComponent(token)}`, {
        method: 'PUT'
      })
  );
}
