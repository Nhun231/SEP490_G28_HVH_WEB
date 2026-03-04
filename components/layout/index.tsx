import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import { Toaster } from '@/components/ui/sonner';
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
      ? 'bg-gradient-to-br from-organizer-light-100 to-organizer-light-50'
      : 'bg-gradient-to-br from-slate-900 to-slate-950');
  const signInPath =
    props.signInPath ??
    (colorVariant === 'organizer'
      ? '/signin/password_signin'
      : '/dashboard/signin');

  return (
    <UserContext.Provider value={props.user}>
      <UserDetailsContext.Provider value={props.userDetails}>
        <OpenContext.Provider value={{ open, setOpen }}>
          <div className={`flex h-full w-full ${shellClassName}`}>
            <Toaster />
            <Sidebar
              routes={effectiveRoutes}
              setOpen={setOpen}
              colorVariant={colorVariant}
              signInPath={signInPath}
            />
            <div className="h-full w-full bg-transparent">
              <main
                className={`mx-2.5 flex-none transition-all bg-transparent md:pr-2 xl:ml-[300px]`}
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
                  <Footer />
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
