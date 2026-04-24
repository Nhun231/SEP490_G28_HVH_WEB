import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  UpdateVolunteerProfileBySystemAdminRequest,
  UpdateVolunteerProfileBySystemAdminResponse
} from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useUpdateVolAccbyAdmin = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/volunteers/${id}/update-vol-profile`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    UpdateVolunteerProfileBySystemAdminResponse | null,
    Error,
    string,
    UpdateVolunteerProfileBySystemAdminRequest
  >(url, (requestUrl, { arg }) =>
    swrFetcher(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(arg)
    })
  );
};
