import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  ActivitySubDomainDetailsResponse,
  ChangeActivitySubDomainVisibilityRequest
} from '@/hooks/dto/activityDomain';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useHideUnhideActivitySubdomain = ({
  id,
  baseUrl = ''
}: Params) => {
  const path = `/sys-admin/activity-domains/activity-subdomains/${id}/change-visibility`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    ActivitySubDomainDetailsResponse | null,
    Error,
    string,
    ChangeActivitySubDomainVisibilityRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
};
