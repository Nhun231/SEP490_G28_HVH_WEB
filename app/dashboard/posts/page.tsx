'use client';

import DashboardLayout from '@/components/layout';
import PostsManagement from '@/components/dashboard/posts';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      if (!user) {
        router.push('/dashboard/signin');
        return;
      }

      setUser(user);
      setUserDetails(userDetails);
    };

    fetchUserData();
  }, [supabase, router]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Quản lý bài đăng"
      description="Xem và quản lý bài đăng công động"
    >
      <PostsManagement />
    </DashboardLayout>
  );
}
