import type { ActivityDomainListResponse } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
  pageNumber?: number;
  pageSize?: number;
  inputActive?: boolean | string;
  name?: string;
  baseUrl?: string;
}

export const useGetListActivityDomain = ({
  pageNumber = 0,
  pageSize = 10,
  inputActive,
  name = '',
  baseUrl = ''
}: Params) => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      pageNumber: String(Math.max(0, pageNumber)),
      pageSize: String(pageSize)
    });

    if (
      inputActive !== undefined &&
      inputActive !== null &&
      inputActive !== ''
    ) {
      queryParams.append('inputActive', String(inputActive));
    }

    if (name.trim() !== '') {
      queryParams.append('name', name.trim());
    }

    const path = `/activity-domains?${queryParams.toString()}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, inputActive, name, pageNumber, pageSize]);

  return useSWR<ActivityDomainListResponse>(url);
};
