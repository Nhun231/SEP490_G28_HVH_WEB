'use client';

import ApprovedEventsClient from './ApprovedEventsClient';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerApprovedEventsPage() {
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
    <ApprovedEventsClient
      user={user}
      userDetails={userDetails}
      detailBasePath="/organizer/approved-events"
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
      topHelperText="Quản lý các sự kiện đã được phê duyệt"
      statusFilters={[
        'Đang tuyển quân',
        'Đã đóng đơn',
        'Đang diễn ra',
        'Đã kết thúc',
        'Hoàn thành'
      ]}
      pageTitle="Sự kiện đã phê duyệt"
      pageDescription="Danh sách các sự kiện đã được phê duyệt"
      emptyStateText="Không có sự kiện đã được phê duyệt"
      badgeFromStatus={true}
      badgeClassName="rounded-full bg-zinc-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150"
      badgeClassNameByStatus={{
        'Đang tuyển quân':
          'rounded-full bg-blue-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-blue-500',
        'Đã đóng đơn':
          'rounded-full bg-yellow-400 text-zinc-900 font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-yellow-300',
        'Đang diễn ra':
          'rounded-full bg-green-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-green-500',
        'Đã kết thúc':
          'rounded-full bg-red-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-red-500',
        'Hoàn thành':
          'rounded-full bg-gray-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-500'
      }}
    />
  );
}
