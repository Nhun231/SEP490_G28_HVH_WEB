import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type { CreateVolunteerAccountByAdminRequest } from '@/hooks/dto';

interface Params {
	baseUrl?: string;
}

export const useCreateVolAccount = ({ baseUrl = '' }: Params = {}) => {
	const path = '/sys-admin/volunteers';
	const url = baseUrl ? `${baseUrl}${path}` : path;

	return useSWRMutation<unknown, Error, string, CreateVolunteerAccountByAdminRequest>(
		url,
		(requestUrl, { arg }) =>
			swrFetcher(requestUrl, {
				method: 'POST',
				body: JSON.stringify(arg)
			})
	);
};
