'use client';

/* eslint-disable */
import NavLink from '@/components/link/NavLink';
import { IRoute } from '@/types/types';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback, useState } from 'react';
import React from 'react';
import { HiChevronDown } from 'react-icons/hi2';

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const pathname = usePathname();
  const [openCollapse, setOpenCollapse] = useState<{ [key: string]: boolean }>(
    {}
  );

  const { routes } = props;

  // Auto-open parent collapse if a child is active
  React.useEffect(() => {
    const newOpenCollapse: { [key: string]: boolean } = {};

    const checkAndOpenParent = (routes: IRoute[], level = 0) => {
      routes.forEach((route, key) => {
        const routeKey = `${level}-${key}`;
        if (route.collapse && route.items) {
          const hasActiveChild = route.items.some(
            (item) =>
              pathname === item.path ||
              (pathname?.startsWith(item.path.split('?')[0]) &&
                item.path !== '#')
          );
          if (hasActiveChild) {
            newOpenCollapse[routeKey] = true;
          }
        }
        if (route.items) {
          checkAndOpenParent(route.items, level + 1);
        }
      });
    };

    checkAndOpenParent(routes);
    setOpenCollapse(newOpenCollapse);
  }, [pathname, routes]);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname]
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[], level = 0) => {
    return routes.map((route, key) => {
      const routeKey = `${level}-${key}`;
      const isOpen = openCollapse[routeKey] || false;

      if (route.disabled) {
        return (
          <div
            key={key}
            className={`flex w-full max-w-full cursor-not-allowed items-center justify-between rounded-lg py-3 pl-8 font-medium`}
          >
            <div className="w-full items-center justify-center">
              <div className="flex w-full items-center justify-center">
                <div className={`text mr-3 mt-1.5 text-slate-500 opacity-50`}>
                  {route.icon}
                </div>
                <p className={`mr-auto text-sm text-slate-500 opacity-50`}>
                  {route.name}
                </p>
              </div>
            </div>
          </div>
        );
      } else if (route.collapse && route.items) {
        return (
          <div key={key}>
            <button
              onClick={() =>
                setOpenCollapse({
                  ...openCollapse,
                  [`${level}-${key}`]: !isOpen
                })
              }
              className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-8 font-medium text-slate-300 hover:text-white`}
            >
              <div className="flex w-full items-center">
                <div className={`text mr-3 mt-1.5 text-slate-300`}>
                  {route.icon}
                </div>
                <p className={`mr-auto text-sm`}>{route.name}</p>
              </div>
              <HiChevronDown
                className={`mr-3 mt-1.5 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="ml-4">{createLinks(route.items, level + 1)}</div>
            )}
          </div>
        );
      } else {
        return (
          <div key={key}>
            <div
              className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-${
                level > 0 ? '12' : '8'
              } ${
                route.path &&
                typeof route.path === 'string' &&
                activeRoute(route.path.toLowerCase())
                  ? 'bg-gradient-to-r from-blue-950 to-slate-800 font-semibold text-white border-l-4 border-blue-500'
                  : 'font-medium text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <NavLink
                href={route.layout ? route.layout + route.path : route.path}
                key={key}
                styles={{ width: '100%' }}
              >
                <div className="w-full items-center justify-center">
                  <div className="flex w-full items-center justify-center">
                    <div
                      className={`text mr-3 mt-1.5 ${
                        activeRoute(route.path.toLowerCase())
                          ? 'font-semibold text-white'
                          : 'text-slate-300'
                      } `}
                    >
                      {route.icon}
                    </div>
                    <p
                      className={`mr-auto text-sm ${
                        activeRoute(route.path.toLowerCase())
                          ? 'font-semibold text-white'
                          : 'font-medium text-slate-300'
                      }`}
                    >
                      {route.name}
                    </p>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
        );
      }
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
