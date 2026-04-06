import { useMemo } from 'react';
import useSWR from 'swr';
import { OrganizationRegistrationDetailsResponse } from '@/hooks/dto';

interface Params {
  id?: string | null;
  baseUrl?: string;
}

export const useOrgRegistrationDetail = ({ id, baseUrl = '' }: Params) => {
  const detailUrl = useMemo(() => {
    if (!id) return null;
    const path = `/sys-admin/organizations/registrations/${id}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, id]);

  return useSWR<OrganizationRegistrationDetailsResponse>(detailUrl);
};
