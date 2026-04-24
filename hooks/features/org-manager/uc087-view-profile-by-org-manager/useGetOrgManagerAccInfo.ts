import type { OrgManagerAccountInformationResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  baseUrl?: string;
  enabled?: boolean;
}

export const useGetOrgManagerAccInfo = ({
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    if (!enabled) {
      return null;
    }

    const path = `/org-manager/org-managers/account-information`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled]);

  return useSWR<OrgManagerAccountInformationResponse>(url);
};
