'use client';

import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import { getActiveRoute } from '@/utils/navigation';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import {
  OpenContext,
  UserContext,
  UserDetailsContext
} from '@/contexts/layout';
import React from 'react';
import type { IRoute } from '@/types/types';

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
  user: User | null | undefined;
  userDetails: User | null | undefined | any;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  shellClassName?: string;
}

const DashboardLayout: React.FC<Props> = (props: Props) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const effectiveRoutes = props.routes ?? routes;
  const colorVariant = props.colorVariant ?? 'admin';
  const shellClassName =
    props.shellClassName ??
    (colorVariant === 'organizer'
      ? 'bg-gradient-to-br from-[#F8FBFF] via-[#EAF2FF] to-[#D7E7FF]'
      : 'bg-gradient-to-br from-[#121A26] via-[#121A2A] to-[#1E2939]');
  const signInPath =
    props.signInPath ??
    (colorVariant === 'organizer'
      ? '/signin/password_signin'
      : '/dashboard/signin');

  return (
    <UserContext.Provider value={props.user}>
      <UserDetailsContext.Provider value={props.userDetails}>
        <OpenContext.Provider value={{ open, setOpen }}>
          <div
            className={`flex min-h-screen w-full overflow-x-hidden ${shellClassName}`}
          >
            <Sidebar
              routes={effectiveRoutes}
              setOpen={setOpen}
              colorVariant={colorVariant}
              signInPath={signInPath}
            />
            <div className="min-w-0 flex-1 bg-transparent">
              <main
                className={`mx-2.5 min-w-0 transition-all bg-transparent md:pr-2 xl:ml-[300px]`}
              >
                <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
                  {props.children}
                </div>
                <Navbar
                  brandText={getActiveRoute(effectiveRoutes, pathname)}
                  colorVariant={colorVariant}
                  signInPath={signInPath}
                />
                <div className="p-3">
                  <Footer colorVariant={colorVariant} />
                </div>
              </main>
            </div>
          </div>
        </OpenContext.Provider>
      </UserDetailsContext.Provider>
    </UserContext.Provider>
  );
};

export default DashboardLayout;
