'use client';

/* eslint-disable */
import AdminNavbarLinks from './NavbarLinksAdmin';
import NavLink from '@/components/link/NavLink';

export default function AdminNavbar(props: {
  brandText: string;
  [x: string]: any;
}) {
  const { brandText } = props;

  return (
    <nav
      className={`fixed right-3 top-3 z-[100] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-lg bg-slate-900/90 py-2 backdrop-blur-xl transition-all border border-slate-700/50 md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)]`}
    >
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <a
            className="hidden text-xs font-normal text-slate-300 hover:underline hover:text-slate-100 md:inline"
            href=""
          >
            Pages
            <span className="mx-1 text-xs text-slate-400"> / </span>
          </a>
          <NavLink
            className="text-xs font-normal capitalize text-slate-300 hover:underline hover:text-slate-100"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize text-white md:text-3xl">
          <NavLink
            href="#"
            className="font-bold capitalize hover:text-slate-200"
          >
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]">
        <AdminNavbarLinks />
      </div>
    </nav>
  );
}
