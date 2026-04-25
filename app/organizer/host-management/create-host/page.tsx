import CreateHostForm from '@/components/dashboard/CreateHostForm';
import { organizerRoutes } from '@/components/routes';
import { getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CreateHostPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return (
    <CreateHostForm
      user={user}
      userDetails={null}
      routes={organizerRoutes}
    />
  );
}
