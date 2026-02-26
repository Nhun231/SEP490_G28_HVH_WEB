import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';

export function useSendRegisterOrgVerifyMail(baseUrl?: string) {
  // Ưu tiên baseUrl truyền vào, nếu không thì lấy từ biến môi trường
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${apiBase}/email-otp/verify-register-organization`;
  return useSWRMutation<any, Error, string, string>(
    url,
    (url, { arg: email }) =>
      swrFetcher(`${url}?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      })
  );
}
