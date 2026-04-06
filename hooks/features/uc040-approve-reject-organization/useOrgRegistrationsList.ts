import { useMemo } from 'react';
import useSWR from 'swr';
import { OrganizationRegistrationSimpleResponse } from '@/hooks/dto';

export interface OrgRegistrationsResponse {
  content: OrganizationRegistrationSimpleResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

interface Params {
  pageNumber: number;
  pageSize: number;
  status: string;
  email?: string;
  baseUrl?: string;
}

export const useOrgRegistrationsList = ({
  pageNumber,
  pageSize,
  status,
  email = '',
  baseUrl = ''
}: Params) => {
  const registrationsUrl = useMemo(() => {
    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize),
      status
    });

    if (email && email.trim() !== '') {
      queryParams.append('email', email);
    }

    const path = `/sys-admin/organizations/registrations?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, email, pageNumber, pageSize, status]);

  return useSWR<OrgRegistrationsResponse>(registrationsUrl);
};
