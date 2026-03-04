import PendingEvents from '@/components/dashboard/pending-events';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OrganizerApprovedEventsPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return (
    <PendingEvents
      user={user}
      userDetails={userDetails}
      detailBasePath="/organizer/approved-events"
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
      statusFilters={[
        'Đang tuyển quân',
        'Đã đóng đơn',
        'Đang diễn ra',
        'Đã kết thúc'
      ]}
      pageTitle="Sự kiện đã phê duyệt"
      pageDescription="Danh sách các sự kiện đã được phê duyệt"
      emptyStateText="Không có sự kiện đã phê duyệt"
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
          'rounded-full bg-red-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-red-500'
      }}
    />
  );
}
