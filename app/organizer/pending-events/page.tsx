import PendingEvents from '@/components/dashboard/pending-events';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OrganizerPendingEventsPage() {
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
      detailBasePath="/organizer/pending-events"
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    />
  );
}
