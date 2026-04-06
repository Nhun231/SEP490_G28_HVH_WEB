import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import { RegisterTokenRequest } from '@/hooks/dto';

export function useRegisterToken(baseUrl?: string) {
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${apiBase}/notifications/register-token`;

  return useSWRMutation<any, Error, string, RegisterTokenRequest>(
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
}
