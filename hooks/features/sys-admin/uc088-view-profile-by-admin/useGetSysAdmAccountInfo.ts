import type { SystemAdminAccountInformationResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  baseUrl?: string;
  enabled?: boolean;
}

export const useGetSysAdmAccountInfo = ({
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    if (!enabled) {
      return null;
    }

    const path = `/sys-admin/sys-admins/account-information`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled]);

  return useSWR<SystemAdminAccountInformationResponse>(url);
};
