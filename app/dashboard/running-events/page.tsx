import RunningEventsContainer from '@/components/dashboard/pending-events/RunningEventsContainer';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function RunningEventsPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <RunningEventsContainer
      user={user}
      userDetails={userDetails}
      colorVariant="admin"
      apiBaseUrl={apiBaseUrl}
    />
  );
}
