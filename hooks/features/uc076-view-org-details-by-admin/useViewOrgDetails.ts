import type { OrganizationDetailsResponseForSystemAdmin } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useViewOrgDetails = ({
  id,
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    const trimmedId = id?.trim();
    if (!enabled || !trimmedId) return null;

    const path = `/sys-admin/organizations/${trimmedId}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, id]);

  return useSWR<OrganizationDetailsResponseForSystemAdmin>(url);
};
