'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserRole } from '@/utils/supabase/queries';

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchRole() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Get role from JWT (app_metadata)
      const userRole = (user.app_metadata?.role as UserRole) || null;
      setRole(userRole);
      setLoading(false);
    }

    fetchRole();

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userRole = (session?.user?.app_metadata?.role as UserRole) || null;
      setRole(userRole);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
}
