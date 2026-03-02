/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { getURL, getStatusRedirect } from '@/utils/helpers';
import Notifications from './components/notification-settings';
import { Input } from '@/components/ui/input';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();
export default function Settings(props: Props) {
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  console.log(props.user);
  console.log(props.userDetails);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new email is the same as the old email
    if (e.currentTarget.newEmail.value === props.user.email) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const newEmail = e.currentTarget.newEmail.value.trim();
    const callbackUrl = getURL(
      getStatusRedirect(
        '/dashboard/settings',
        'Thành công!',
        `Email của bạn đã được cập nhật.`
      )
    );
    e.preventDefault();
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: callbackUrl
      }
    );
    router.push('/dashboard/settings');
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === props.user.user_metadata.full_name) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const fullName = e.currentTarget.fullName.value.trim();

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', props.user?.id);
    if (error) {
      console.log(error);
    }
    e.preventDefault();
    supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    router.push('/dashboard/settings');
    setIsSubmitting(false);
  };

  const notifications = [
    { message: 'Cuộc gọi của bạn đã được xác nhận.', time: '1 giờ trước' },
    { message: 'Bạn có tin nhắn mới!', time: '1 giờ trước' },
    { message: 'Gói đăng ký của bạn sắp hết hạn!', time: '2 giờ trước' }
  ];

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Cài đặt tài khoản"
      description="Cài đặt hồ sơ."
    >
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="maw-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card
            className={
              'mb-5 h-min flex items-center aligh-center max-w-full py-8 px-4 bg-white border-zinc-200 shadow-sm dark:border-zinc-800'
            }
          >
            <Avatar className="min-h-[68px] min-w-[68px]">
              <AvatarImage src={props.user?.user_metadata.avatar_url} />
              <AvatarFallback className="text-2xl font-bold dark:text-zinc-950">
                {props.user.user_metadata.full_name &&
                props.user.user_metadata.full_name.length > 0
                  ? `${props.user.user_metadata.full_name[0]}`
                  : props.user?.user_metadata.email &&
                      props.user.user_metadata.email.length > 0
                    ? `${props.user.user_metadata.email[0].toUpperCase()}`
                    : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-extrabold text-zinc-950 leading-[100%] dark:text-white pl-4 md:text-3xl">
                {props.user.user_metadata.full_name}
              </p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-2 pl-4 md:text-base">
                Giám đốc & Nhà sáng lập
              </p>
            </div>
          </Card>
          <Card
            className={
              'mb-5 h-min max-w-full pt-8 pb-6 px-6 bg-white border-zinc-200 shadow-sm dark:border-zinc-800'
            }
          >
            <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
              Thông tin tài khoản
            </p>
            <p className="mb-6 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Tại đây bạn có thể thay đổi thông tin tài khoản
            </p>
            <label
              className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'name'}
            >
              Họ và tên
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (Tối đa 30 ký tự)
              </p>
            </label>
            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="nameForm"
                onSubmit={(e) => handleSubmitName(e)}
              >
                <Input
                  type="text"
                  name="fullName"
                  // defaultValue={props.user?.user_metadata.full_name ?? ''}
                  defaultValue={props.userDetails?.full_name ?? ''}
                  placeholder="Vui lòng nhập họ và tên"
                  className={`mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0 bg-white border-zinc-300 focus:border-zinc-400`}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px]"
                form="nameForm"
                type="submit"
              >
                Cập nhật tên
              </Button>
              <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            </div>
            <p
              className={`mb-5 px-2.5 text-red-500 md:px-9 ${
                nameError?.status ? 'block' : 'hidden'
              }`}
            >
              {nameError?.message}
            </p>
            <label
              className="mb-3 ml-2.5 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'email'}
            >
              Email của bạn
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (Chúng tôi sẽ gửi email để xác minh thay đổi)
              </p>
            </label>

            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="emailForm"
                onSubmit={(e) => handleSubmitEmail(e)}
              >
                <Input
                  placeholder="Vui lòng nhập email"
                  defaultValue={props.user.email ?? ''}
                  type="text"
                  name="newEmail"
                  className={`mr-4 flex h-full max-w-full w-full items-center justify-center px-4 py-4 outline-none bg-white border-zinc-300 focus:border-zinc-400`}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base md:ms-4 font-medium md:w-[300px]"
                type="submit"
                form="emailForm"
              >
                Cập nhật email
              </Button>
            </div>
          </Card>
          <Notifications notifications={notifications} />
        </div>
      </div>
    </DashboardLayout>
  );
}
