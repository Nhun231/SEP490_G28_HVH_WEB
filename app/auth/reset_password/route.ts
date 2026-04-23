import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getOtpTypes(type: string | null): EmailOtpType[] {
  const types: EmailOtpType[] = [];

  if (type === 'recovery' || type === 'email') {
    types.push(type);
  }

  if (!types.includes('recovery')) {
    types.unshift('recovery');
  }

  return types;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const otpTypes = getOtpTypes(requestUrl.searchParams.get('type'));
  const nextParam = requestUrl.searchParams.get('next');
  const nextPath =
    nextParam === '/dashboard/signin/update_password' ||
    nextParam === '/signin/update_password'
      ? nextParam
      : '/signin/update_password';
  const forgotPath = nextPath.startsWith('/dashboard/')
    ? '/dashboard/signin/forgot_password'
    : '/signin/forgot_password';

  const supabase = await createClient();
  let authError: Error | null = null;

  if (tokenHash) {
    for (const otpType of otpTypes) {
      const { error } = await supabase.auth.verifyOtp({
        type: otpType,
        token_hash: tokenHash
      });

      if (!error) {
        authError = null;
        break;
      }

      authError = error;
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else {
    authError = new Error('Missing recovery token.');
  }

  if (authError) {
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}${forgotPath}`,
        'Xác thực thất bại.',
        authError.message ||
          'Không thể xác thực yêu cầu đặt lại mật khẩu. Vui lòng thử lại.'
      )
    );
  }

  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}${nextPath}`,
      'Xác thực thành công.',
      'Vui lòng nhập mật khẩu mới cho tài khoản của bạn.'
    )
  );
}
