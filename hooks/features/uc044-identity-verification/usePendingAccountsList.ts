import { useMemo } from 'react';
import useSWR from 'swr';

export interface PendingAccountsResponse {
  content: Array<{
    id: string;
    email: string | null;
    cid: string | null;
    status: string | null;
    createdAt: string | null;
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

export const usePendingAccounts = ({
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
      status,
      email: email.trim()
    });

    const path = `/sys-admin/volunteers/registrations?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, email, pageNumber, pageSize, status]);

  return useSWR<PendingAccountsResponse>(registrationsUrl);
};
