'use client';

import PasswordSignIn from '@/components/auth-ui/PasswordSignIn';
import Separator from '@/components/auth-ui/Separator';
import ForgotPassword from '@/components/auth-ui/ForgotPassword';
import UpdatePassword from '@/components/auth-ui/UpdatePassword';

export default function AuthUI(props: any) {
  const isAdmin = props.isAdmin ?? false;
  const status: string | undefined = props.status;
  const statusDescription: string | undefined = props.statusDescription;
  const error: string | undefined = props.error;
  const errorDescription: string | undefined = props.errorDescription;
  const hasToast = Boolean(status || error);
  const toastTitleRaw: string | undefined = status || error;
  const toastDescriptionRaw: string | undefined =
    statusDescription || errorDescription;

  const viMap: Record<string, string> = {
    'Success!': 'Thành công!',
    'Sign in failed.': 'Đăng nhập thất bại.',
    'Sign up failed.': 'Đăng ký thất bại.',
    'Invalid email address.': 'Email không hợp lệ.',
    'Invalid login credentials': 'Thông tin đăng nhập không đúng.',
    'Please try again.': 'Vui lòng thử lại.',
    'Unable to validate email address: invalid format':
      'Không thể xác thực địa chỉ email: định dạng không hợp lệ.',
    'Please check your email for a password reset link. You may now close this tab.':
      'Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu. Bạn có thể đóng tab này.',
    'You are now signed in.': 'Bạn đã đăng nhập thành công.',
    'Your password has been updated.': 'Mật khẩu của bạn đã được cập nhật.'
  };

  const translate = (value: string | undefined) => {
    if (!value) return value;
    if (viMap[value]) return viMap[value];

    if (value.trim().toLowerCase() === 'missing email or phone') {
      return 'Vui lòng nhập email hoặc số điện thoại.';
    }

    if (value.trim().toLowerCase() === 'invalid login credentials') {
      return 'Thông tin đăng nhập không đúng.';
    }

    const passwordPolicyMatch = value.match(
      /^Password should be at least 8 characters\.\s*Password should contain at least one character of each:\s*[\s\S]*$/
    );
    if (passwordPolicyMatch) {
      return 'Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 chữ thường (a-z), 1 chữ hoa (A-Z) và 1 chữ số (0-9).';
    }

    if (/^Password should be at least 8 characters\.?$/.test(value.trim())) {
      return 'Mật khẩu phải có ít nhất 8 ký tự.';
    }

    const rateLimitMatch = value.match(
      /^For security purposes, you can only request this after\s+(\d+)\s+seconds\.?$/
    );
    if (rateLimitMatch) {
      const seconds = rateLimitMatch[1];
      return `Vì lý do bảo mật, bạn chỉ có thể yêu cầu lại sau ${seconds} giây.`;
    }

    return value;
  };

  const toastTitle = translate(toastTitleRaw);
  const toastDescription = translate(toastDescriptionRaw);
  const toastVariant = status ? 'status' : 'error';

  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      <p className="text-[32px] font-bold text-foreground">
        {props.viewProp === 'forgot_password'
          ? 'Quên mật khẩu'
          : props.viewProp === 'update_password'
            ? 'Cập nhật mật khẩu'
            : 'Đăng nhập'}
      </p>
      <p className="mb-2.5 mt-2.5 font-normal text-muted-foreground">
        {props.viewProp === 'forgot_password'
          ? 'Nhập email để nhận liên kết đặt lại mật khẩu!'
          : props.viewProp === 'update_password'
            ? 'Chọn mật khẩu mới cho tài khoản của bạn!'
            : 'Nhập email và mật khẩu để đăng nhập!'}
      </p>
      {hasToast && (
        <div
          className={`mt-4 rounded-md border px-4 py-3 text-sm ${
            toastVariant === 'status'
              ? 'border-emerald-200 bg-emerald-100 text-emerald-950'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          }`}
        >
          <p className="font-semibold">{toastTitle}</p>
          {toastDescription && (
            <p className="mt-1 opacity-90">{toastDescription}</p>
          )}
        </div>
      )}
      {props.viewProp !== 'update_password' && (
        <>
          <Separator />
        </>
      )}
      {props.viewProp === 'password_signin' && (
        <PasswordSignIn
          redirectMethod={props.redirectMethod}
          isAdmin={isAdmin}
        />
      )}
      {props.viewProp === 'forgot_password' && (
        <ForgotPassword
          redirectMethod={props.redirectMethod}
          disableButton={props.disableButton}
          isAdmin={isAdmin}
        />
      )}
      {props.viewProp === 'update_password' && (
        <UpdatePassword
          redirectMethod={props.redirectMethod}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
