import { redirect } from 'next/navigation';
import OrganizationDetailPage from '@/components/dashboard/organizations/detail';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserDetails } from '@/utils/supabase/queries';

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params }: Props) {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <OrganizationDetailPage
      orgId={params.id}
      user={user}
      userDetails={userDetails}
    />
  );
}
