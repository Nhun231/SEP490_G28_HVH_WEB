'use client';

import OrganizerMainDashboard from '@/components/dashboard/organizer-main';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerMain() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      if (!user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(user);
      setUserDetails(userDetails);
    };

    fetchUserData();
  }, [supabase, router]);

  return (
    <OrganizerMainDashboard
      user={user}
      userDetails={userDetails}
      title="Bảng điều khiển tổ chức"
      description="Theo dõi năng suất Host và luồng phê duyệt nội bộ"
      signInPath="/signin/password_signin"
    />
  );
}
