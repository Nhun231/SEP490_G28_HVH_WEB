import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  UpdateSystemAdminProfileRequest,
  UpdateSystemAdminProfileResponse
} from '@/hooks/dto';

interface Params {
  baseUrl?: string;
}

export const useUpdateSystemAminProfile = ({ baseUrl = '' }: Params) => {
  const path = '/sys-admin/sys-admins/update-profile';
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    UpdateSystemAdminProfileResponse | null,
    Error,
    string,
    UpdateSystemAdminProfileRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'PUT',
      body: JSON.stringify(arg)
    })
  );
};
