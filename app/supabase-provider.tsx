'use client';

import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import { swrFetcher } from '@/utils/swr-fetcher';

type BrowserSupabaseClient = ReturnType<typeof createClient>;

type SupabaseContext = {
  supabase: BrowserSupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(createClient);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        router.refresh();
        return;
      }

      if (event === 'SIGNED_OUT') {
        const isProtectedPath =
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/organizer');

        if (!isProtectedPath) {
          return;
        }

        const signInPath = pathname.startsWith('/dashboard')
          ? '/dashboard/signin/password_signin'
          : '/signin/password_signin';

        router.replace(signInPath);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 10000,
          focusThrottleInterval: 5000
        }}
      >
        {children}
      </SWRConfig>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};
