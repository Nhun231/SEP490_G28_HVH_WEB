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

const supabase = createClient();

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const redirectMethod = getRedirectMethod();
  const { routes } = props;

  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const handleSignOut = async (e) => {
    e.preventDefault();
    supabase.auth.signOut();
    if (redirectMethod === 'client') {
      router.push('/dashboard/signin');
    } else {
      window.location.href = '/dashboard/signin';
    }
  };
  // SIDEBAR
  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-screen w-[300px] bg-gradient-to-b from-slate-900 to-slate-950 transition-all md:!z-[99] xl:!z-0 ${
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
                className="absolute top-4 right-4 block cursor-pointer text-slate-400 hover:text-white xl:hidden"
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
              <div className="mb-8 mt-8 h-px bg-slate-700" />
              {/* Nav item */}
              <ul>
                <Links routes={routes} />
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
