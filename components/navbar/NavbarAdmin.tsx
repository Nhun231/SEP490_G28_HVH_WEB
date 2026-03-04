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
      ? 'bg-organizer-secondary-100/75 border border-organizer-secondary-100/80'
      : 'bg-slate-900/90 border border-slate-700/50';
  const crumbBaseClassName =
    colorVariant === 'organizer'
      ? 'text-xs font-normal text-slate-600 hover:underline hover:text-slate-800'
      : 'text-xs font-normal text-slate-300 hover:underline hover:text-slate-100';
  const crumbSlashClassName =
    colorVariant === 'organizer' ? 'text-slate-400' : 'text-slate-400';
  const brandLinkClassName =
    colorVariant === 'organizer'
      ? 'text-xs font-normal capitalize text-slate-600 hover:underline hover:text-slate-800'
      : 'text-xs font-normal capitalize text-slate-300 hover:underline hover:text-slate-100';
  const brandTitleWrapperClassName =
    colorVariant === 'organizer'
      ? 'text-md shrink capitalize text-slate-900 md:text-3xl'
      : 'text-md shrink capitalize text-white md:text-3xl';
  const brandTitleLinkClassName =
    colorVariant === 'organizer'
      ? 'font-bold capitalize hover:text-slate-700'
      : 'font-bold capitalize hover:text-slate-200';

  return (
    <nav
      className={`fixed right-3 top-3 z-[40] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-lg py-2 backdrop-blur-xl transition-all md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)] ${navClassName}`}
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
