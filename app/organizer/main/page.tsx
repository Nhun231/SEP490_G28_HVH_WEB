import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function OrganizerMain() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin/password_signin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với Hà Nội Thiện Nguyện
        </h1>
        <p className="text-xl text-gray-600 mb-8">Xin chào, {user.email}</p>
        <p className="text-gray-500">
          Trang chính của organizer đang được phát triển...
        </p>
      </div>
    </div>
  );
}
