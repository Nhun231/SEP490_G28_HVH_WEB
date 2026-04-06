import { useMemo } from 'react';
import useSWR from 'swr';

export interface PendingAccountDetailResponse {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  cidFrontUrl: string | null;
  cidBackUrl: string | null;
  cidHoldingUrl: string | null;
  status: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
  reviewAt: string | null;
  reviewBy: string | null;
  volunteer: unknown | null;
  note: string | null;
}

interface Params {
  id?: string | null;
  baseUrl?: string;
}

export const usePendingAccountDetail = ({ id, baseUrl = '' }: Params) => {
  const detailUrl = useMemo(() => {
    if (!id) return null;
    const path = `/sys-admin/volunteers/registrations/${id}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, id]);

  return useSWR<PendingAccountDetailResponse>(detailUrl);
};
