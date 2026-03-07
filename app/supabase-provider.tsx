'use client';

import type { Database } from '@/types/types_db';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import { swrFetcher } from '@/utils/swr-fetcher';
import { useNotificationPermission } from '@/hooks/use-notification-permission';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const router = useRouter();
  const { requestPermission } = useNotificationPermission();

  useEffect(() => {
    const triggerNotificationRegistration = async () => {
      try {
        await requestPermission();
      } catch (error) {
        console.error('Failed to trigger notification registration flow:', error);
      }
    };

    // Login qua server action thường không bắn SIGNED_IN ở client,
    // nên chủ động kiểm tra session hiện tại khi component mount.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        void triggerNotificationRegistration();
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        router.refresh();
        await triggerNotificationRegistration();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requestPermission, router, supabase]);

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
