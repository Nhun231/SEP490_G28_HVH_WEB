import type { HostActivitiesListResponseForSystemAdmin } from '@/hooks/dto';
import { useMemo } from 'react';
import useSWR from 'swr';

interface Params {
	hostId?: string;
	pageNumber?: number;
	pageSize?: number;
	fromDate?: string;
	toDate?: string;
	baseUrl?: string;
	enabled?: boolean;
}

export const useGetHostActivitesbySysAdmin = ({
	hostId,
	pageNumber = 0,
	pageSize = 10,
	fromDate,
	toDate,
	baseUrl = '',
	enabled = true
}: Params = {}) => {
	const url = useMemo(() => {
		const trimmedHostId = hostId?.trim();
		if (!enabled || !trimmedHostId) {
			return null;
		}

		const effectiveFromDate = fromDate?.trim() || '1900-01-01';
		const effectiveToDate = toDate?.trim() || '2999-12-31';

		const queryParams = new URLSearchParams({
			pageNumber: String(Math.max(0, pageNumber)),
			pageSize: String(Math.max(1, pageSize)),
			fromDate: effectiveFromDate,
			toDate: effectiveToDate
		});

		const path = `/sys-admin/hosts/${trimmedHostId}/activities?${queryParams.toString()}`;
		return baseUrl ? `${baseUrl}${path}` : path;
	}, [baseUrl, enabled, hostId, pageNumber, pageSize, fromDate, toDate]);

	return useSWR<HostActivitiesListResponseForSystemAdmin>(url);
};
