import OrganizerMainDashboard from '@/components/dashboard/organizer-main';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails } from '@/utils/supabase/queries';

export default async function OrganizerMain() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin/password_signin');
  }

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
