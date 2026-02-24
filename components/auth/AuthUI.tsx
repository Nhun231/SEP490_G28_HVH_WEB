'use client';

import PasswordSignIn from '@/components/auth-ui/PasswordSignIn';
import Separator from '@/components/auth-ui/Separator';
import ForgotPassword from '@/components/auth-ui/ForgotPassword';
import UpdatePassword from '@/components/auth-ui/UpdatePassword';
import SignUp from '@/components/auth-ui/Signup';

export default function AuthUI(props: any) {
  const isAdmin = props.isAdmin ?? false;

  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      <p className="text-[32px] font-bold text-zinc-950 dark:text-white">
        {props.viewProp === 'signup'
          ? 'Đăng ký'
          : props.viewProp === 'forgot_password'
            ? 'Quên mật khẩu'
            : props.viewProp === 'update_password'
              ? 'Cập nhật mật khẩu'
              : 'Đăng nhập'}
      </p>
      <p className="mb-2.5 mt-2.5 font-normal text-zinc-950 dark:text-zinc-400">
        {props.viewProp === 'signup'
          ? 'Nhập email và mật khẩu để đăng ký!'
          : props.viewProp === 'forgot_password'
            ? 'Nhập email để nhận liên kết đặt lại mật khẩu!'
            : props.viewProp === 'update_password'
              ? 'Chọn mật khẩu mới cho tài khoản của bạn!'
              : 'Nhập email và mật khẩu để đăng nhập!'}
      </p>
      {props.viewProp !== 'update_password' && props.viewProp !== 'signup' && (
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
        />
      )}
      {props.viewProp === 'update_password' && (
        <UpdatePassword redirectMethod={props.redirectMethod} />
      )}
      {props.viewProp === 'signup' && (
        <SignUp redirectMethod={props.redirectMethod} />
      )}
    </div>
  );
}
