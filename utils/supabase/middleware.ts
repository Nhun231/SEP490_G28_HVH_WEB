import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    const path = request.nextUrl.pathname;
    const isDashboardRoute = path.startsWith('/dashboard');
    const isDashboardSignin = path.startsWith('/dashboard/signin');
    const isOrganizerRoute = path.startsWith('/organizer');
    const isHomeAlias = path === '/' || path === '/home' || path === '/index';

    if (path === '/organizer/signin' || path.startsWith('/organizer/signin/')) {
      return NextResponse.redirect(
        new URL('/signin/password_signin', request.url)
      );
    }

    if (!isDashboardRoute && !isOrganizerRoute && !isHomeAlias) {
      return NextResponse.next({
        request: {
          headers: request.headers
        }
      });
    }

    if (isDashboardSignin) {
      return NextResponse.next({
        request: {
          headers: request.headers
        }
      });
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    const {
      data: { session }
    } = await supabase.auth.getSession();

    const currentUser = session
      ? (await supabase.auth.getUser()).data.user
      : null;

    const userRole = currentUser?.app_metadata?.role;
    const isLoggedIn = !!currentUser;

    if (path.startsWith('/dashboard') && !isDashboardSignin && !isLoggedIn) {
      return NextResponse.redirect(
        new URL('/dashboard/signin/password_signin', request.url)
      );
    }

    if (isOrganizerRoute && !isLoggedIn) {
      return NextResponse.redirect(
        new URL('/signin/password_signin', request.url)
      );
    }

    if (
      path.startsWith('/dashboard') &&
      !isDashboardSignin &&
      isLoggedIn &&
      userRole !== 'SYS_ADMIN'
    ) {
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'Tài khoản hoặc mật khẩu không hợp lệ');
      return NextResponse.redirect(url);
    }

    if (
      (path === '/' || path === '/home' || path === '/index') &&
      !isLoggedIn
    ) {
      return NextResponse.redirect(
        new URL('/signin/password_signin', request.url)
      );
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
