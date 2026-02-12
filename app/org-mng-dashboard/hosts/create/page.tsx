import OrgMngLayout from '@/components/org-mng-dashboard/layout/OrgMngLayout';
import CreateHostForm from '@/components/org-mng-dashboard/hosts/CreateHostForm';
import CreateHostHeader from '@/components/org-mng-dashboard/hosts/CreateHostHeader';
import { createClient } from '@/utils/supabase/server';
import { getUserWithRole, getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function CreateHostPage() {
  const supabase = await createClient();
  const { user, role } = await getUserWithRole(supabase);

  if (!user || role !== 'ORG_MANAGER') {
    return redirect('/dashboard/signin');
  }

  const { profile } = await getUserProfile(supabase);

  return (
    <OrgMngLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Header with Bulk Create Button */}
        <CreateHostHeader />

        {/* Form */}
        <CreateHostForm />
      </div>
    </OrgMngLayout>
  );
}
