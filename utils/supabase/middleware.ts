import { Database } from '@/types/types_db';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const supabase = createServerClient<Database, 'public', Database['public']>(
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

    const user = await supabase.auth.getUser();

    const userRole = user.data?.user?.app_metadata?.role;
    const path = request.nextUrl.pathname;
    const isLoggedIn = !!user.data?.user;

    // Backward compatibility: old clients may still navigate to this legacy
    // organizer sign-in route after logout.
    if (path === '/organizer/signin' || path.startsWith('/organizer/signin/')) {
      return NextResponse.redirect(
        new URL('/signin/password_signin', request.url)
      );
    }

    const isDashboardSignin = path.startsWith('/dashboard/signin');
    const isOrganizerRoute = path.startsWith('/organizer');

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
