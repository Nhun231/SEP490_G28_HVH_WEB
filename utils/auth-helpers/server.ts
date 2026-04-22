'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getURL, getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
}

async function getRequestURL(path?: string) {
  const headerStore = await headers();
  const host =
    headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  const proto =
    headerStore.get('x-forwarded-proto') ??
    (host?.includes('localhost') ? 'http' : 'https');

  if (!host) {
    return getURL(path);
  }

  const origin = `${proto}://${host}`;
  const normalizedOrigin = origin.endsWith('/') ? origin : `${origin}/`;

  if (!path) {
    return normalizedOrigin;
  }

  const normalizedPath = path.replace(/^\/+/, '');
  return normalizedPath
    ? `${normalizedOrigin}${normalizedPath}`
    : normalizedOrigin;
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      'https://horizon-ui.com/dashboard/settings',
      'Hmm... Something went wrong.',
      'You could not be signed out.'
    );
  }

  return '/dashboard/signin';
}

export async function requestPasswordUpdate(formData: FormData) {
  const isAdmin = String(formData.get('isAdmin') || '').trim() === 'true';
  const basePath = isAdmin ? '/dashboard/signin' : '/signin';
  const nextPath = isAdmin
    ? '/dashboard/signin/update_password'
    : '/signin/update_password';
  const callbackURL = await getRequestURL(
    `/auth/reset_password?next=${encodeURIComponent(nextPath)}`
  );

  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      `${basePath}/forgot_password`,
      'Email không hợp lệ.',
      'Vui lòng thử lại.'
    );
    return redirectPath;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackURL
  });

  if (error) {
    redirectPath = getErrorRedirect(
      `${basePath}/forgot_password`,
      error.message,
      'Vui lòng thử lại.'
    );
  } else if (data) {
    redirectPath = getStatusRedirect(
      `${basePath}/forgot_password`,
      'Thành công!',
      'Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu. Bạn có thể đóng tab này.',
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      `${basePath}/forgot_password`,
      'Có lỗi xảy ra.',
      'Không thể gửi email đặt lại mật khẩu.'
    );
  }

  return redirectPath;
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = await cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const isAdmin = String(formData.get('isAdmin') || '').trim() === 'true';
  let redirectPath: string;

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirectPath = getErrorRedirect(
      isAdmin ? '/dashboard/signin/password_signin' : '/signin/password_signin',
      'Sign in failed.',
      error.message
    );
  } else if (data.user) {
    const userRole = data.user.app_metadata?.role;
    if (isAdmin && userRole !== 'SYS_ADMIN') {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/password_signin',
        'Đăng nhập thất bại.',
        'Chỉ tài khoản SYS_ADMIN mới được phép đăng nhập vào trang quản trị.'
      );
    } else {
      cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
      redirectPath = getStatusRedirect(
        isAdmin ? '/dashboard/main' : '/organizer/main',
        'Success!',
        'You are now signed in.'
      );
    }
  } else {
    redirectPath = getErrorRedirect(
      isAdmin ? '/dashboard/signin/password_signin' : '/signin/password_signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.'
    );
  }

  return redirectPath;
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password')).trim();
  const passwordConfirm = String(formData.get('passwordConfirm')).trim();
  const isAdmin = String(formData.get('isAdmin') || '').trim() === 'true';
  const updatePasswordPath = isAdmin
    ? '/dashboard/signin/update_password'
    : '/signin/update_password';
  const signInPath = isAdmin
    ? '/dashboard/signin/password_signin'
    : '/signin/password_signin';
  let redirectPath: string;

  if (password !== passwordConfirm) {
    redirectPath = getErrorRedirect(
      updatePasswordPath,
      'Không thể cập nhật mật khẩu.',
      'Mật khẩu xác nhận không khớp.'
    );
    return redirectPath;
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirectPath = getErrorRedirect(
      updatePasswordPath,
      'Không thể cập nhật mật khẩu.',
      error.message
    );
  } else if (data.user) {
    redirectPath = getStatusRedirect(
      signInPath,
      'Thành công!',
      'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.'
    );
  } else {
    redirectPath = getErrorRedirect(
      updatePasswordPath,
      'Có lỗi xảy ra.',
      'Không thể cập nhật mật khẩu.'
    );
  }

  return redirectPath;
}

export async function updateEmail(formData: FormData) {
  const newEmail = String(formData.get('newEmail')).trim();

  if (!isValidEmail(newEmail)) {
    return getErrorRedirect(
      '/dashboard/settings',
      'Your email could not be updated.',
      'Invalid email address.'
    );
  }

  const supabase = await createClient();

  const callbackUrl = await getRequestURL(
    getStatusRedirect(
      '/dashboard/settings',
      'Success!',
      `Your email has been updated.`
    )
  );

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: callbackUrl
    }
  );

  if (error) {
    return getErrorRedirect(
      '/dashboard/settings',
      'Your email could not be updated.',
      error.message
    );
  } else {
    return getStatusRedirect(
      '/dashboard/settings',
      'Confirmation emails sent.',
      `You will need to confirm the update by clicking the links sent to both the old and new email addresses.`
    );
  }
}

export async function updateName(formData: FormData) {
  const fullName = String(formData.get('fullName')).trim();

  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });

  if (error) {
    return getErrorRedirect(
      '/dashboard/settings',
      'Your name could not be updated.',
      error.message
    );
  } else if (data.user) {
    return getStatusRedirect(
      '/dashboard/settings',
      'Success!',
      'Your name has been updated.'
    );
  } else {
    return getErrorRedirect(
      '/dashboard/settings',
      'Hmm... Something went wrong.',
      'Your name could not be updated.'
    );
  }
}
