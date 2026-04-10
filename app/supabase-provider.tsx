'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {
      // Avoid refreshing on SIGNED_OUT to prevent racing against explicit
      // logout redirects from the UI (navbar/sidebar).
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          shouldRetryOnError: false,
          revalidateOnFocus: false
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
