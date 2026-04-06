import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

export interface VerifyIdentityPayload {
  approve: boolean;
  rejectionReason: string | null;
  fullName: string;
}

export interface VerifyIdentityResponse {
  id: string;
  status: string;
  message?: string;
}

interface Params {
  id: string;
  baseUrl?: string;
}

export const useVerifyIdentity = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/volunteers/registrations/${id}/verify`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    VerifyIdentityResponse | null,
    Error,
    string,
    VerifyIdentityPayload
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
  );
};
