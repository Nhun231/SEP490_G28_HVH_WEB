'use client';

import DashboardLayout from '@/components/layout';
import PendingAccountDetail from '@/components/dashboard/pending-accounts/detail';
import { usePendingAccountDetail } from '@/hooks/features/uc044-identity-verification/usePendingAccountDetail';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  id: string;
}

export default function PendingAccountDetailContainer({
  user,
  userDetails,
  id
}: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = usePendingAccountDetail({
    id,
    baseUrl: apiBaseUrl
  });

  const volunteer = (data as any)?.volunteer;
  const defaultFullName =
    volunteer && typeof volunteer === 'object'
      ? ((volunteer as any).fullName ??
        (volunteer as any).full_name ??
        (volunteer as any).name ??
        (volunteer as any).full_name_vi ??
        null)
      : null;

  if (isLoading) {
    return (
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết tài khoản"
        description="Thông tin chi tiết tài khoản chờ phê duyệt"
      >
        <div className="w-full">
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-zinc-600">Đang tải dữ liệu...</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết tài khoản"
        description="Thông tin chi tiết tài khoản chờ phê duyệt"
      >
        <div className="w-full">
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-red-600">Không thể tải dữ liệu.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const verification = data
    ? {
        id: data.id,
        cid: data.cid ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        cid_front: data.cidFrontUrl ?? null,
        cid_back: data.cidBackUrl ?? null,
        cid_holding: data.cidHoldingUrl ?? null,
        status: data.status ?? null,
        rejection_reason: data.rejectionReason ?? null,
        created_at: data.createdAt ?? null,
        reviewed_by: data.reviewBy ?? null,
        reviewed_at: data.reviewAt ?? null,
        volunteer_id: null,
        note: data.note ?? null
      }
    : null;

  return (
    <PendingAccountDetail
      user={user}
      userDetails={userDetails}
      verification={verification}
      defaultFullName={
        typeof defaultFullName === 'string' ? defaultFullName : null
      }
    />
  );
}
