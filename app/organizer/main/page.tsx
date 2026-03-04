import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails } from '@/utils/supabase/queries';

export default async function OrganizerMain() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return redirect('/organizer/pending-events');
}
