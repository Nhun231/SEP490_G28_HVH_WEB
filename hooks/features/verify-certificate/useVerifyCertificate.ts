import type { VerifyCertificateResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  certificateCode?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export const useVerifyCertificate = ({
  certificateCode,
  baseUrl = '',
  enabled = true
}: Params = {}) => {
  const url = useMemo(() => {
    const trimmedCode = certificateCode?.trim();
    if (!enabled || !trimmedCode) return null;

    const path = `/certificates/verify/${encodeURIComponent(trimmedCode)}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, certificateCode, enabled]);

  return useSWR<VerifyCertificateResponse>(url);
};
