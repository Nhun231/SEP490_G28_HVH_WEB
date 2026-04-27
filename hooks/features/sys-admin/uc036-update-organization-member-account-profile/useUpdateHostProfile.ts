import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type {
  UpdateHostProfileRequest,
  HostInfoResponseForSystemAdmin
} from '@/hooks/dto';

interface Params {
  hostId: string;
  baseUrl?: string;
}

export const useUpdateHostProfile = ({ hostId, baseUrl = '' }: Params) => {
  const trimmedHostId = hostId?.trim();
  const path = trimmedHostId ? `/sys-admin/hosts/${trimmedHostId}/update-profile` : null;
  const url = path ? (baseUrl ? `${baseUrl}${path}` : path) : null;

  return useSWRMutation<
    HostInfoResponseForSystemAdmin | null,
    Error,
    string | null,
    UpdateHostProfileRequest
  >(url, (requestUrl, { arg }) =>
    swrFetcher(requestUrl!, {
      method: 'PUT',
      body: JSON.stringify(arg)
    })
  );
};
