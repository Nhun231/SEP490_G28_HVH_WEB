import OrgMngLayout from '@/components/org-mng-dashboard/layout/OrgMngLayout';
import OrgMngDashboard from '@/components/org-mng-dashboard/dashboard';
import { createClient } from '@/utils/supabase/server';
import { getUserWithRole, getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OrgManagerDashboardPage() {
  const supabase = await createClient();
  const { user, role } = await getUserWithRole(supabase);

  if (!user || role !== 'ORG_MANAGER') {
    return redirect('/dashboard/signin');
  }

  const { profile } = await getUserProfile(supabase);

  return (
    <OrgMngLayout user={user} profile={profile}>
      <OrgMngDashboard user={user} profile={profile} />
    </OrgMngLayout>
  );
}
