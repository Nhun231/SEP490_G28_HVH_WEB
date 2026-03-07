'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OpenContext, UserContext } from '@/contexts/layout';
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
import {
  clearStoredNotificationToken,
  getStoredNotificationToken
} from '@/hooks/use-notification-permission';

const supabase = createClient();
export default function HeaderLinks(props: {
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  settingsPath?: string;
  [x: string]: any;
}) {
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { trigger: unregisterToken } = useUnregisterToken();
  const colorVariant = props.colorVariant ?? 'admin';
  const signInPath = props.signInPath ?? '/dashboard/signin';
  const settingsPath = props.settingsPath ?? '/dashboard/settings';
  const onOpen = () => {
    setOpen(false);
  };

  // Ensures this component is rendered only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

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

    await supabase.auth.signOut();
    router.push(signInPath);
  };
  if (!mounted) return null;

  const iconButtonClassName =
    colorVariant === 'organizer'
      ? 'flex h-9 min-w-9 cursor-pointer rounded-full border-organizer-secondary-100/70 bg-white/70 p-0 text-xl text-slate-700 hover:bg-white hover:text-slate-900 md:min-h-10 md:min-w-10'
      : 'flex h-9 min-w-9 cursor-pointer rounded-full border-slate-600 bg-slate-800/50 p-0 text-xl text-slate-200 hover:bg-slate-700 hover:text-white md:min-h-10 md:min-w-10';
  const menuButtonClassName =
    colorVariant === 'organizer'
      ? `${iconButtonClassName} xl:hidden`
      : `${iconButtonClassName} xl:hidden`;
  const signOutIconClassName =
    colorVariant === 'organizer'
      ? 'h-4 w-4 stroke-2 text-slate-700'
      : 'h-4 w-4 stroke-2 text-slate-200';

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
          <AvatarImage
            src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
          />
          <AvatarFallback className="font-bold">
            {user?.user_metadata?.full_name
              ? `${user?.user_metadata?.full_name[0]}`
              : user?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}
