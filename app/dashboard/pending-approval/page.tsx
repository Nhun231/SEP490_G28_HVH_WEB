import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PendingApproval from '@/components/dashboard/pending-approval';

export default async function PendingApprovalPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .eq('id', session?.user?.id)
    .single();

  return <PendingApproval user={session?.user} userDetails={userDetails} />;
}
