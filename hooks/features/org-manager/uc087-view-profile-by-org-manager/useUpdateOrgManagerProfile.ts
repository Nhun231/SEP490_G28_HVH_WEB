import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  UpdateOrgManagerProfileRequest,
  UpdateOrgManagerProfileResponse
} from '@/hooks/dto';

interface Params {
  baseUrl?: string;
}

export const useUpdateOrgManagerProfile = ({ baseUrl = '' }: Params) => {
  const path = '/org-manager/org-managers/update-profile';
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    UpdateOrgManagerProfileResponse | null,
    Error,
    string,
    UpdateOrgManagerProfileRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'PUT',
      body: JSON.stringify(arg)
    })
  );
};
