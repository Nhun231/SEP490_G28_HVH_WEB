import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  UpdateActivityDomainRequest,
  ActivityDomainDetailsResponse
} from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useUpdateActivityDomain = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/activity-domains/${id}/update`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    ActivityDomainDetailsResponse | null,
    Error,
    string,
    UpdateActivityDomainRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
  );
};
