import type { HostInfoResponseForManager } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  id?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useViewHostInfo = ({
  id,
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    const trimmedId = id?.trim();
    if (!enabled || !trimmedId) return null;

    const path = `/org-manager/hosts/${trimmedId}/info`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, enabled, id]);

  return useSWR<HostInfoResponseForManager>(url);
};
