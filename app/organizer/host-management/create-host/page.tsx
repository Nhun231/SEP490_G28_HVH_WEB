import CreateHostForm from '@/components/dashboard/CreateHostForm';
import { organizerRoutes } from '@/components/routes';
import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CreateHostPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return (
    <CreateHostForm
      user={user}
      userDetails={userDetails}
      routes={organizerRoutes}
    />
  );
}
