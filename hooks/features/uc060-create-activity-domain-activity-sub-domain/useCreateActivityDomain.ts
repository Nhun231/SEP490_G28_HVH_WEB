import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  CreateActivityDomainRequest,
  ActivityDomainDetailsResponse
} from '@/hooks/dto';

interface Params {
  baseUrl: string;
}

export const useCreateActivityDomain = ({ baseUrl }: Params) => {
  const path = '/sys-admin/activity-domains/create';
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    ActivityDomainDetailsResponse | null,
    Error,
    string,
    CreateActivityDomainRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
  );
};
