import OrgMngLayout from '@/components/org-mng-dashboard/layout/OrgMngLayout';
import { createClient } from '@/utils/supabase/server';
import { getUserWithRole, getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const { user, role } = await getUserWithRole(supabase);

  if (!user || role !== 'ORG_MANAGER') {
    return redirect('/dashboard/signin');
  }

  const { profile } = await getUserProfile(supabase);

  return (
    <OrgMngLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Phê duyệt sự kiện
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Danh sách các sự kiện chờ phê duyệt
            </p>
          </div>
          <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
            7 chờ duyệt
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Trang phê duyệt sự kiện đang được phát triển...
          </p>
        </div>
      </div>
    </OrgMngLayout>
  );
}
