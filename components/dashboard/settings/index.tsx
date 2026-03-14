/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Chưa có dữ liệu';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export default function Settings(props: Props) {
  const router = useRouter();
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const displayName = useMemo(() => {
    return (
      props.userDetails?.full_name ??
      props.user?.user_metadata?.full_name ??
      props.user?.email?.split('@')[0] ??
      'Chưa cập nhật'
    );
  }, [
    props.userDetails?.full_name,
    props.user?.user_metadata?.full_name,
    props.user?.email
  ]);

  const displayEmail = props.user?.email ?? 'Chưa cập nhật';
  const displayPhone =
    props.user?.phone ??
    props.userDetails?.phone ??
    props.user?.user_metadata?.phone ??
    null;
  const displayAvatar =
    props.userDetails?.avatar_url ??
    props.user?.user_metadata?.avatar_url ??
    undefined;

  const roleName =
    props.user?.app_metadata?.role ??
    props.userDetails?.role ??
    props.userDetails?.role_name ??
    'Người dùng';

  const organizationName =
    props.userDetails?.organization_name ??
    props.userDetails?.organizationName ??
    props.userDetails?.org_name ??
    props.userDetails?.orgName ??
    props.userDetails?.organization ??
    props.user?.user_metadata?.organization_name ??
    props.user?.user_metadata?.organizationName ??
    props.user?.user_metadata?.org_name ??
    props.user?.user_metadata?.orgName ??
    props.user?.user_metadata?.organization ??
    null;

  const [fullNameInput, setFullNameInput] = useState(displayName);

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingName(true);
    setNameError(null);
    setSuccessMessage(null);

    const fullName = fullNameInput.trim();

    if (!fullName) {
      setNameError('Vui lòng nhập họ và tên.');
      setIsSubmittingName(false);
      return;
    }

    if (fullName.length > 30) {
      setNameError('Họ và tên không được vượt quá 30 ký tự.');
      setIsSubmittingName(false);
      return;
    }

    if (fullName === displayName) {
      setNameError('Tên mới trùng với tên hiện tại.');
      setIsSubmittingName(false);
      return;
    }

    const { error: updateUserTableError } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', props.user?.id);

    if (updateUserTableError) {
      setNameError(updateUserTableError.message);
      setIsSubmittingName(false);
      return;
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (updateAuthError) {
      setNameError(updateAuthError.message);
      setIsSubmittingName(false);
      return;
    }

    setSuccessMessage('Đã cập nhật họ và tên thành công.');
    router.refresh();
    setIsSubmittingName(false);
  };

  const initials =
    displayName && displayName.length > 0
      ? displayName.charAt(0).toUpperCase()
      : displayEmail.charAt(0).toUpperCase();

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Cài đặt hồ sơ"
      description="Quản lý và cập nhật thông tin tài khoản từ Supabase."
    >
      <div className="mx-auto w-full max-w-6xl pb-16 pt-2">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="border-zinc-200 bg-white p-6 shadow-sm xl:col-span-1">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-white shadow-sm">
                  <AvatarImage src={displayAvatar} />
                  <AvatarFallback className="bg-sky-100 text-xl font-bold text-sky-700">
                    {initials || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-extrabold text-zinc-900">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-600">
                    {displayEmail}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                  {String(roleName)}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-300 text-zinc-600"
                >
                  {props.user?.email_confirmed_at
                    ? 'Email đã xác minh'
                    : 'Email chưa xác minh'}
                </Badge>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Tổ chức
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {organizationName ?? 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Ngày tham gia
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {formatDateTime(props.user?.created_at)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Lần đăng nhập gần nhất
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {formatDateTime(props.user?.last_sign_in_at)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-zinc-900">
                Thông tin tài khoản
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Dữ liệu hiển thị được đồng bộ từ Supabase (Auth và bảng users).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  User ID
                </p>
                <p className="mt-1 break-all text-sm font-medium text-zinc-900">
                  {props.user?.id ?? 'Chưa có dữ liệu'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Số điện thoại
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {displayPhone ?? 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Credits
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {props.userDetails?.credits ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Trial Credits
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {props.userDetails?.trial_credits ?? 0}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-zinc-200" />

            <div className="space-y-5">
              <form onSubmit={handleSubmitName} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <UserRound className="h-4 w-4 text-zinc-500" />
                  Họ và tên (tối đa 30 ký tự)
                </label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input
                    type="text"
                    name="fullName"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="Vui lòng nhập họ và tên"
                    className="border-zinc-300 bg-white focus-visible:ring-zinc-300"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingName}
                    className="md:min-w-[180px]"
                  >
                    {isSubmittingName ? 'Đang cập nhật...' : 'Cập nhật tên'}
                  </Button>
                </div>
                {nameError && (
                  <p className="text-sm text-red-500">{nameError}</p>
                )}
              </form>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  Email
                </label>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <p className="text-sm font-medium text-zinc-900">
                    {displayEmail}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Email không cho phép cập nhật tại đây.
                  </p>
                </div>
              </div>

              {successMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  Trạng thái bảo mật
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {props.user?.email_confirmed_at
                    ? 'Tài khoản đã xác minh email.'
                    : 'Tài khoản chưa xác minh email.'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  Liên hệ
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {displayPhone ??
                    'Chưa cập nhật số điện thoại trong Supabase.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
