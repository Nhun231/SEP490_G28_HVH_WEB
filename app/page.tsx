import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const [user] = await Promise.all([getUser(supabase)]);

  if (!user) {
    return redirect('/signin/password_signin');
  } else {
    redirect('/organizer/main');
  }
}
