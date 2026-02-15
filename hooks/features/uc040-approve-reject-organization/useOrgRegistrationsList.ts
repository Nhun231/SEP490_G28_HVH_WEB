import { useMemo } from 'react';
import useSWR from 'swr';

export interface OrgRegistrationsResponse {
  content: Array<{
    id: string;
    name: string | null;
    dhaRegistered: boolean | null;
    orgType: string | null;
    managerFullName: string | null;
    managerCid: string | null;
    managerEmail: string | null;
  }>;
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

    const path = `/organization/registrations?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, email, pageNumber, pageSize, status]);

  return useSWR<OrgRegistrationsResponse>(registrationsUrl);
};
