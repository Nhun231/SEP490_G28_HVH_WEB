import type { OrganizationListResponseForAdmin } from '@/hooks/dto';
import { EOrgType } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  orgTypes?: EOrgType[];
  baseUrl?: string;
  enabled?: boolean;
}

export const useSearchAndViewOrgs = ({
  pageNumber = 0,
  pageSize = 20,
  name = '',
  orgTypes = [],
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    if (!enabled) return null;

    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize)
    });

    if (name.trim() !== '') {
      queryParams.append('name', name.trim());
    }

    orgTypes.forEach((orgType) => {
      queryParams.append('orgTypes', orgType);
    });

    const path = `/sys-admin/organizations?${queryParams.toString()}`;

    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, name, orgTypes, pageNumber, pageSize]);

  return useSWR<OrganizationListResponseForAdmin>(url);
};
