import OrgMngLayout from '@/components/org-mng-dashboard/layout/OrgMngLayout';
import { createClient } from '@/utils/supabase/server';
import { getUserWithRole, getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { user, role } = await getUserWithRole(supabase);

  if (!user || role !== 'ORG_MANAGER') {
    return redirect('/dashboard/signin');
  }

  const { profile } = await getUserProfile(supabase);

  return (
    <OrgMngLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Thông tin cá nhân
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân
          </p>
        </div>

        <div className="max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Họ và tên</label>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {profile?.full_name || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ</label>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {profile?.address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrgMngLayout>
  );
}
