'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  OpenContext,
  UserContext,
  UserDetailsContext
} from '@/contexts/layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import {
  HiOutlineInformationCircle,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import { createClient } from '@/utils/supabase/client';
import { useUnregisterToken } from '@/hooks/features/commons/notification/use-unregister-token';
import { useGetSysAdmAccountInfo } from '@/hooks/features/sys-admin/uc088-view-profile-by-admin/useGetSysAdmAccountInfo';
import { useGetOrgManagerAccInfo } from '@/hooks/features/org-manager/uc087-view-profile-by-org-manager/useGetOrgManagerAccInfo';
import {
  clearStoredNotificationToken,
  getStoredNotificationToken
} from '@/hooks/use-notification-permission';
import { getFullSupabaseImageUrl } from '@/utils/helpers';

const supabase = createClient();
export default function HeaderLinks(props: {
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  settingsPath?: string;
  [x: string]: any;
}) {
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { trigger: unregisterToken } = useUnregisterToken();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const colorVariant = props.colorVariant ?? 'admin';
  const signInPath =
    props.signInPath ??
    (colorVariant === 'organizer'
      ? '/signin/password_signin'
      : '/dashboard/signin/password_signin');
  const settingsPath = props.settingsPath ?? '/dashboard/settings';
  const onOpen = () => {
    setOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: sysAdmAccountInfo } = useGetSysAdmAccountInfo({
    baseUrl: apiBaseUrl,
    enabled: colorVariant === 'admin'
  });
  const { data: orgManagerAccountInfo } = useGetOrgManagerAccInfo({
    baseUrl: apiBaseUrl,
    enabled: colorVariant === 'organizer'
  });

  const profileInfo =
    colorVariant === 'admin' ? sysAdmAccountInfo : orgManagerAccountInfo;

  const rawAvatarUrl =
    profileInfo?.avatarUrl ??
    userDetails?.avatarUrl ??
    userDetails?.avatar_url ??
    userDetails?.avatar ??
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.avatarUrl ??
    user?.user_metadata?.picture ??
    user?.user_metadata?.avatar ??
    user?.app_metadata?.avatar_url ??
    user?.app_metadata?.picture ??
    '';
  const avatarSrc = rawAvatarUrl
    ? getFullSupabaseImageUrl(String(rawAvatarUrl)) || '/default-avatar.png'
    : '/default-avatar.png';

  const fullName =
    profileInfo?.fullName ??
    userDetails?.fullName ??
    userDetails?.full_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.fullName ??
    user?.user_metadata?.name ??
    user?.user_metadata?.display_name ??
    '';
  const fallbackInitial = fullName
    ? String(fullName).trim().charAt(0).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const handleSignOut = async (e) => {
    e.preventDefault();

    const token = getStoredNotificationToken();
    if (token) {
      try {
        await unregisterToken(token);
        clearStoredNotificationToken();
      } catch (error) {
        console.error('Failed to unregister notification token:', error);
      }
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      router.replace(signInPath);
      router.refresh();
    }
  };
  if (!mounted) return null;

  const iconButtonClassName =
    colorVariant === 'organizer'
      ? 'flex h-9 min-w-9 cursor-pointer rounded-full border-[#BFDBFE] bg-[#EFF6FF]/95 p-0 text-xl text-[#1E3A8A] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] md:min-h-10 md:min-w-10'
      : 'flex h-9 min-w-9 cursor-pointer rounded-full border-[#1E2939] bg-[#1A2434]/90 p-0 text-xl text-slate-200 hover:bg-[#1D2737] hover:text-white md:min-h-10 md:min-w-10';
  const menuButtonClassName =
    colorVariant === 'organizer'
      ? `${iconButtonClassName} xl:hidden`
      : `${iconButtonClassName} xl:hidden`;
  const signOutIconClassName =
    colorVariant === 'organizer'
      ? 'h-4 w-4 stroke-2 text-[#1E3A8A]'
      : 'h-4 w-4 stroke-2 text-[#E5ECF5]';

  return (
    <div className="relative flex min-w-max max-w-max flex-grow items-center justify-around gap-1 rounded-lg md:px-2 md:py-2 md:pl-3 xl:gap-2">
      <Button
        variant="outline"
        className={menuButtonClassName}
        onClick={onOpen}
      >
        <FiAlignJustify className="h-4 w-4" />
      </Button>

      <Button
        onClick={(e) => handleSignOut(e)}
        variant="outline"
        className={iconButtonClassName}
      >
        <HiOutlineArrowRightOnRectangle className={signOutIconClassName} />
      </Button>
      <Link className="w-full" href={settingsPath}>
        <Avatar className="h-9 min-w-9 md:min-h-10 md:min-w-10">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback className="font-bold">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}
