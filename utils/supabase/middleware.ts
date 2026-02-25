import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
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

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    const userRole = user.data?.user?.app_metadata?.role;
    const path = request.nextUrl.pathname;
    const isLoggedIn = !!user.data?.user;

    // Exclude /dashboard/signin/* from redirect logic
    const isDashboardSignin = path.startsWith('/dashboard/signin');

    // If accessing /dashboard (except /dashboard/signin/*) and not logged in, redirect to /dashboard/signin/password_signin
    if (path.startsWith('/dashboard') && !isDashboardSignin && !isLoggedIn) {
      return NextResponse.redirect(
        new URL('/dashboard/signin/password_signin', request.url)
      );
    }

    // If accessing /dashboard (except /dashboard/signin/*) and logged in but not SYS_ADMIN:
    if (
      path.startsWith('/dashboard') &&
      !isDashboardSignin &&
      isLoggedIn &&
      userRole !== 'SYS_ADMIN'
    ) {
      await supabase.auth.signOut();
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'Tài khoản hoặc mật khẩu không hợp lệ');
      return NextResponse.redirect(url);
    }

    // If accessing / and not logged in, redirect to /signin/password_signin
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
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
