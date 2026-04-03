'use client';

/* eslint-disable */
import AdminNavbarLinks from './NavbarLinksAdmin';
import NavLink from '@/components/link/NavLink';

export default function AdminNavbar(props: {
  brandText: string;
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  settingsPath?: string;
  [x: string]: any;
}) {
  const { brandText } = props;
  const colorVariant = props.colorVariant ?? 'admin';

  const navClassName =
    colorVariant === 'organizer'
      ? 'border border-[#BFDBFE] bg-[#FFFFFF]/90 shadow-[0_10px_24px_rgba(59,130,246,0.18)]'
      : 'border border-[#1E2939]/80 bg-[#121A2A]/88 shadow-[0_10px_30px_rgba(10,16,28,0.28)]';
  const navEffectClassName =
    colorVariant === 'organizer' ? 'backdrop-blur-0' : 'backdrop-blur-xl';
  const crumbBaseClassName =
    colorVariant === 'organizer'
      ? 'text-xs font-normal text-[#1E3A8A] hover:underline hover:text-[#1D4ED8]'
      : 'text-xs font-normal text-slate-300 hover:underline hover:text-[#F4F7FB]';
  const crumbSlashClassName =
    colorVariant === 'organizer' ? 'text-[#3B82F6]' : 'text-slate-500';
  const brandLinkClassName =
    colorVariant === 'organizer'
      ? 'text-xs font-normal capitalize text-[#1E3A8A] hover:underline hover:text-[#1D4ED8]'
      : 'text-xs font-normal capitalize text-slate-300 hover:underline hover:text-[#F4F7FB]';
  const brandTitleWrapperClassName =
    colorVariant === 'organizer'
      ? 'text-md shrink capitalize text-[#1E3A8A] md:text-3xl'
      : 'text-md shrink capitalize text-white md:text-3xl';
  const brandTitleLinkClassName =
    colorVariant === 'organizer'
      ? 'font-bold capitalize hover:text-[#1D4ED8]'
      : 'font-bold capitalize hover:text-[#E8EEF7]';

  return (
    <nav
      className={`fixed right-3 top-3 z-[40] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-lg py-2 transition-all md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)] ${navClassName} ${navEffectClassName}`}
    >
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <a className={`hidden md:inline ${crumbBaseClassName}`} href="">
            Pages
            <span className={`mx-1 text-xs ${crumbSlashClassName}`}> / </span>
          </a>
          <NavLink className={brandLinkClassName} href="#">
            {brandText}
          </NavLink>
        </div>
        <p className={brandTitleWrapperClassName}>
          <NavLink href="#" className={brandTitleLinkClassName}>
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]">
        <AdminNavbarLinks
          colorVariant={colorVariant}
          signInPath={props.signInPath}
          settingsPath={props.settingsPath}
        />
      </div>
    </nav>
  );
}
