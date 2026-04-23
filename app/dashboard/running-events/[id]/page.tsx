import PendingEventDetailContainer from '@/components/dashboard/pending-events/detail-container';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function RunningEventDetailPage({
  params
}: {
  params: Promise<{ id: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const eventId = Array.isArray(id) ? id[0] : id;

  if (!eventId) {
    return redirect('/dashboard/running-events');
  }

  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <PendingEventDetailContainer
      user={user}
      userDetails={userDetails}
      id={eventId}
      backBasePath="/dashboard/running-events"
      pageDescription="Thông tin chi tiết sự kiện đang diễn ra"
    />
  );
}
