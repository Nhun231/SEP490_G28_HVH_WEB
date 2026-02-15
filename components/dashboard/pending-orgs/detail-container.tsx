'use client';

import DashboardLayout from '@/components/layout';
import PendingOrgDetail from '@/components/dashboard/pending-orgs/detail';
import { useOrgRegistrationDetail } from '@/hooks/features/uc040-approve-reject-organization/useOrgRegistrationDetail';
import { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  id: string;
}

export default function PendingOrgDetailContainer({
  user,
  userDetails,
  id
}: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = useOrgRegistrationDetail({
    id,
    baseUrl: apiBaseUrl
  });

  if (isLoading) {
    return (
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết tổ chức"
        description="Thông tin chi tiết tổ chức chờ phê duyệt"
      >
        <div className="w-full">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết tổ chức"
        description="Thông tin chi tiết tổ chức chờ phê duyệt"
      >
        <div className="w-full">
          <p className="text-red-500">Không thể tải dữ liệu.</p>
        </div>
      </DashboardLayout>
    );
  }

  const detail = data
    ? {
        id: data.id,
        name: data.name ?? null,
        dhaRegistered: data.dhaRegistered ?? null,
        orgType: data.orgType ?? null,
        orgIntroduction: data.orgIntroduction ?? null,
        managerFullName: data.managerFullName ?? null,
        managerCid: data.managerCid ?? null,
        managerPhone: data.managerPhone ?? null,
        managerEmail: data.managerEmail ?? null,
        managerCidFrontUrl: data.managerCidFrontUrl ?? null,
        managerCidBackUrl: data.managerCidBackUrl ?? null,
        managerCidHoldingUrl: data.managerCidHoldingUrl ?? null,
        otherEvidencesUrls: data.otherEvidencesUrls ?? null,
        applicationReason: data.applicationReason ?? null,
        status: data.status ?? null,
        rejectionReason: data.rejectionReason ?? null,
        createdAt: data.createdAt ?? null,
        reviewedAt: data.reviewedAt ?? null,
        reviewedBy: data.reviewedBy ?? null,
        organization: data.organization ?? null,
        orgManager: data.orgManager ?? null,
        note: data.note ?? null
      }
    : null;

  return (
    <PendingOrgDetail user={user} userDetails={userDetails} detail={detail} />
  );
}
