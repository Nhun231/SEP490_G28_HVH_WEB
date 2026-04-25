'use client';

import PendingAccounts from '@/components/dashboard/pending-accounts';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingAccountsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/dashboard/signin');
        return;
      }

      setUser(user);
    };

    fetchUserData();
  }, [supabase, router]);

  return <PendingAccounts user={user} userDetails={null} accounts={[]} />;
}
