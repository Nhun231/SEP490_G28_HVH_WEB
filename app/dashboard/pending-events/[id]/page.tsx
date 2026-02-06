import PendingEventDetail from '@/components/dashboard/pending-events/detail';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

export default async function PendingEventDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <PendingEventDetail
      user={user}
      userDetails={userDetails}
      eventId={params.id}
    />
  );
}
