import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import { RegisterOrganizationRequest } from '@/hooks/dto';

export function useRegisterOrg(baseUrl?: string) {
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${apiBase}/organization/register-org`;
  return useSWRMutation<any, Error, string, RegisterOrganizationRequest>(
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
