'use client';

import { Button } from '@/components/ui/button';
import { useSupabase } from '@/app/supabase-provider';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Input } from '../ui/input';

interface PasswordSignInProps {
  redirectMethod: string;
  isAdmin?: boolean;
}

export default function PasswordSignIn({
  redirectMethod,
  isAdmin = false
}: PasswordSignInProps) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        router.push(
          getErrorRedirect(
            isAdmin
              ? '/dashboard/signin/password_signin'
              : '/signin/password_signin',
            'Sign in failed.',
            error.message
          )
        );
        return;
      }

      const userRole = data.user?.app_metadata?.role;
      if (isAdmin && userRole !== 'SYS_ADMIN') {
        await supabase.auth.signOut();
        router.push(
          getErrorRedirect(
            '/dashboard/signin/password_signin',
            'Đăng nhập thất bại.',
            'Chỉ tài khoản SYS_ADMIN mới được phép đăng nhập vào trang quản trị.'
          )
        );
        return;
      }

      console.log('[Auth] Access token:', data.session?.access_token);

      document.cookie =
        'preferredSignInView=password_signin; path=/; SameSite=Lax';

      router.push(
        getStatusRedirect(
          isAdmin ? '/dashboard/main' : '/organizer/main',
          'Success!',
          'You are now signed in.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitButtonClassName = isAdmin
    ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white hover:from-slate-950 hover:via-blue-950 hover:to-slate-900'
    : '';

  return (
    <div>
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <input
          type="hidden"
          name="isAdmin"
          value={isAdmin ? 'true' : 'false'}
        />
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label
              className={`text-sm font-medium ${isAdmin ? 'text-foreground' : 'text-[#3A4163]'}`}
              htmlFor="email"
            >
              Email
            </label>
            <Input
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3"
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
            />
            <label
              className={`mt-2 text-sm font-medium ${isAdmin ? 'text-foreground' : 'text-[#3A4163]'}`}
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              placeholder="Mật khẩu"
              type="password"
              name="password"
              autoComplete="current-password"
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium ${submitButtonClassName}`}
          >
            {isSubmitting ? (
              <svg
                aria-hidden="true"
                role="status"
                className={`mr-2 inline h-4 w-4 animate-spin duration-500 ${
                  isAdmin ? 'text-white/80' : 'text-primary-foreground/80'
                }`}
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="white"
                ></path>
              </svg>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </div>
      </form>
      <p>
        <a
          href={
            isAdmin
              ? '/dashboard/signin/forgot_password'
              : '/signin/forgot_password'
          }
          className={`text-sm font-medium ${isAdmin ? 'text-foreground hover:text-primary' : 'text-[#3A4163] hover:text-[#5AA8D6]'}`}
        >
          Quên mật khẩu?
        </a>
      </p>
      {!isAdmin && (
        <p>
          <a
            href="/register-org"
            className="text-sm font-medium text-[#3A4163] hover:text-[#5AA8D6]"
          >
            Chưa có tài khoản? Đăng ký
          </a>
        </p>
      )}
    </div>
  );
}
