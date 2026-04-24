import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

interface Params {
	id: string;
	baseUrl?: string;
}

export const useDeleteEventMoment = ({ id, baseUrl = '' }: Params) => {
	const path = `/sys-admin/event-moments/${id}/delete-moment`;
	const url = id ? (baseUrl ? `${baseUrl}${path}` : path) : null;

	return useSWRMutation<void, Error, string, void>(url, (requestUrl) =>
		swrFetcher(requestUrl, {
			method: 'DELETE'
		})
	);
};
