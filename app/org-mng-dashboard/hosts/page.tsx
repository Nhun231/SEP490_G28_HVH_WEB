import OrgMngLayout from '@/components/org-mng-dashboard/layout/OrgMngLayout';
import HostManagement from '@/components/org-mng-dashboard/hosts/HostManagement';
import { createClient } from '@/utils/supabase/server';
import { getUserWithRole, getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { MdAdd } from 'react-icons/md';

export default async function HostsPage() {
  const supabase = await createClient();
  const { user, role } = await getUserWithRole(supabase);

  if (!user || role !== 'ORG_MANAGER') {
    return redirect('/dashboard/signin');
  }

  const { profile } = await getUserProfile(supabase);

  return (
    <OrgMngLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Quản lý Host
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Danh sách và quản lý các host trong tổ chức
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#42A5F5] hover:bg-[#64B5F6] text-white rounded-lg font-medium transition-colors shadow-md">
            <MdAdd className="text-xl" />
            <span>Tạo Host mới</span>
          </button>
        </div>

        {/* Host Management Component */}
        <HostManagement />
      </div>
    </OrgMngLayout>
  );
}
