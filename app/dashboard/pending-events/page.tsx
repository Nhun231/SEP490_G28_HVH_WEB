import PendingEvents from '@/components/dashboard/pending-events';
import PendingEventsContainer from '@/components/dashboard/pending-events/PendingEventsContainer';
import { usePendingEvents } from '@/hooks/features/list-event-for-admin/usePendingEvents';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function PendingEventsPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  // Fetch pending events for admin
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  // usePendingEvents is a hook, but page.tsx is an async function (server component).
  // To use SWR or hooks, you need a client component wrapper.
  // So, create a PendingEventsContainer client component to handle fetching.
  return (
    <PendingEventsContainer
      user={user}
      userDetails={userDetails}
      colorVariant="admin"
      apiBaseUrl={apiBaseUrl}
    />
  );
}
