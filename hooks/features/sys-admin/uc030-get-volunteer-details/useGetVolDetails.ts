import type { VolunteerAccountInformationResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useGetVolDetails = ({
  id,
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    const trimmedId = id?.trim();
    if (!enabled || !trimmedId) return null;

    const path = `/sys-admin/volunteers/${trimmedId}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, id]);

  return useSWR<VolunteerAccountInformationResponse>(url);
};
