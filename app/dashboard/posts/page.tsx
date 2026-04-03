import DashboardLayout from '@/components/layout';
import PostsManagement from '@/components/dashboard/posts';
import { createClient } from '@/utils/supabase/server';

export default async function PostsPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <DashboardLayout
      user={user}
      title="Quản lý bài đăng"
      description="Xem và quản lý bài đăng công động"
    >
      <PostsManagement />
    </DashboardLayout>
  );
}
