import PendingEventDetail from '@/components/dashboard/pending-events/detail';
import { organizerRoutes } from '@/components/routes';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OrganizerPendingEventDetailPage({
  params
}: {
  params: Promise<{ id: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const eventId = Array.isArray(id) ? id[0] : id;
  if (!eventId) {
    return redirect('/organizer/pending-events');
  }

  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return (
    <PendingEventDetail
      user={user}
      userDetails={userDetails}
      eventId={eventId}
      backBasePath="/organizer/pending-events"
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    />
  );
}
