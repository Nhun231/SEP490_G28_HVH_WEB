'use client';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { IRoute } from '@/types/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { PropsWithChildren, useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { HiX } from 'react-icons/hi';
import { HiBolt } from 'react-icons/hi2';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { UserContext, UserDetailsContext } from '@/contexts/layout';
import { createClient } from '@/utils/supabase/client';
import { useUnregisterToken } from '@/hooks/features/commons/notification/use-unregister-token';
import {
  clearStoredNotificationToken,
  getStoredNotificationToken
} from '@/hooks/use-notification-permission';

const supabase = createClient();

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const redirectMethod = getRedirectMethod();
  const { routes } = props;
  const colorVariant = props.colorVariant ?? 'admin';
  const signInPath = props.signInPath ?? '/dashboard/signin';

  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const { trigger: unregisterToken } = useUnregisterToken();

  const getOrgNameCandidate = (candidate: unknown) => {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === 'object') {
      const name = (candidate as { name?: unknown }).name;
      if (typeof name === 'string' && name.trim().length > 0) {
        return name.trim();
      }
    }

    return null;
  };

  const orgNameCandidates = [
    userDetails?.organization_name,
    userDetails?.organizationName,
    userDetails?.org_name,
    userDetails?.orgName,
    userDetails?.organization,
    userDetails?.org,
    user?.user_metadata?.organization_name,
    user?.user_metadata?.organizationName,
    user?.user_metadata?.org_name,
    user?.user_metadata?.orgName,
    user?.user_metadata?.organization,
    user?.user_metadata?.org
  ];

  const organizerName = orgNameCandidates.find(
    (candidate) => getOrgNameCandidate(candidate) !== null
  );
  const organizerDisplayName =
    getOrgNameCandidate(organizerName) ?? 'Tổ chức của bạn';

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
    if (redirectMethod === 'client') {
      router.push(signInPath);
    } else {
      window.location.href = signInPath;
    }
  };
  // SIDEBAR
  const sidebarBgClass =
    colorVariant === 'organizer'
      ? 'bg-gradient-to-b from-[#5AA8D6] via-[#4A89B5] to-[#3A4163]'
      : 'bg-gradient-to-b from-[#121A2A] via-[#1A2434] to-[#1D2737]';
  const dividerClass =
    colorVariant === 'organizer' ? 'bg-[#CBE3EF]/45' : 'bg-[#1E2939]';

  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-screen w-[300px] ${sidebarBgClass} transition-all md:!z-[99] xl:!z-0 ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${props.open ? '' : '-translate-x-[120%] xl:translate-x-[unset]'}`}
    >
      <div className="h-screen w-full overflow-y-auto overflow-x-hidden px-4 py-4">
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
          universal={true}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <span
                className="absolute top-4 right-4 block cursor-pointer text-slate-400 hover:text-[#F3F6FB] xl:hidden"
                onClick={() => props.setOpen(false)}
              >
                <HiX />
              </span>
              <div className={`mt-8 flex items-center justify-center`}>
                <Image
                  src="/img/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-sm mr-5"
                />
                <h5 className="me-2 text-2xl font-bold leading-5 text-white">
                  <span className="block">Hà Nội</span>
                  <span className="mt-2   block">Thiện Nguyện</span>
                </h5>
              </div>
              {colorVariant === 'organizer' && (
                <div className="mx-auto mt-4 w-[92%] max-w-[260px] rounded-xl border border-[#CBE3EF]/70 bg-white/18 px-4 py-2.5 text-center shadow-lg shadow-[#3A4163]/20 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EDF3FB]">
                    To chuc
                  </p>
                  <p className="mt-0.5 truncate text-base font-extrabold tracking-[0.01em] text-white">
                    {organizerDisplayName}
                  </p>
                </div>
              )}
              <div className={`mb-8 mt-8 h-px ${dividerClass}`} />
              {/* Nav item */}
              <ul>
                <Links routes={routes} colorVariant={colorVariant} />
              </ul>
            </div>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}

// PROPS

export default Sidebar;
