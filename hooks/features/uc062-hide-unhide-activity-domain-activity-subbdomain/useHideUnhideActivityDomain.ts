import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import {
  ActivityDomainDetailsResponse,
  ChangeActivityDomainVisibilityRequest
} from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useHideUnhideActivityDomain = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/activity-domains/${id}/change-visibility`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    ActivityDomainDetailsResponse | null,
    Error,
    string,
    ChangeActivityDomainVisibilityRequest
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
