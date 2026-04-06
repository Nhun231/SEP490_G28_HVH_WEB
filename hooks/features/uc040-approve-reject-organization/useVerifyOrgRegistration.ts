import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import { OrganizationRegistrationVerifyRequest } from '@/hooks/dto';

interface Params {
  id: string;
  baseUrl?: string;
}

export const useVerifyOrgRegistration = ({ id, baseUrl = '' }: Params) => {
  const path = `/sys-admin/organizations/registrations/${id}/verify`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return useSWRMutation<
    void,
    Error,
    string,
    OrganizationRegistrationVerifyRequest
  >(url, (url, { arg }) =>
    swrFetcher(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
  );
};
