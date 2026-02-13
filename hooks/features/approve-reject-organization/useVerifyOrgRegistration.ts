import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

export interface VerifyOrgRegistrationPayload {
  approve: boolean;
  rejectionReason?: string | null;
}

export interface VerifyOrgRegistrationResponse {
  id: string;
  status: string;
  message?: string;
}

interface Params {
  id: string;
  baseUrl?: string;
}

export const useVerifyOrgRegistration = ({ id, baseUrl = '' }: Params) => {
  const path = `/organization/registrations/${id}/verify`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    VerifyOrgRegistrationResponse,
    Error,
    string,
    VerifyOrgRegistrationPayload
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
  );
};
