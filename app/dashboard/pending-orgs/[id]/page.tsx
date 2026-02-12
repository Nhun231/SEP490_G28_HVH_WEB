import PendingOrgDetailContainer from '@/components/dashboard/pending-orgs/detail-container';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

export default async function PendingOrgDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <PendingOrgDetailContainer
      user={user}
      userDetails={userDetails}
      id={params.id}
    />
  );
}
