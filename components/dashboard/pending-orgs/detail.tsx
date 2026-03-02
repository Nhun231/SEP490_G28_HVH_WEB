/* eslint-disable @next/next/no-img-element */

'use client';

import DashboardLayout from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useVerifyOrgRegistration } from '@/hooks/features/uc040-approve-reject-organization/useVerifyOrgRegistration';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrgRegistrationDetail {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: string | null;
  orgIntroduction: string | null;
  managerFullName: string | null;
  managerCid: string | null;
  managerPhone: string | null;
  managerEmail: string | null;
  managerCidFrontUrl: string | null;
  managerCidBackUrl: string | null;
  managerCidHoldingUrl: string | null;
  otherEvidencesUrls: string[] | null;
  applicationReason: string | null;
  status: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  reviewedBy: {
    id: string;
    cid: string | null;
    email: string | null;
    phone: string | null;
    fullName: string | null;
  } | null;
  organization: {
    id: string;
    name: string | null;
    dhaRegistered: boolean | null;
    orgType: string | null;
    orgIntroduction: string | null;
    otherEvidences: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  orgManager: {
    id: string;
    cid: string | null;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  note: string | null;
}

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  detail: OrgRegistrationDetail | null;
}

const renderValue = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return String(value);
};

const renderStatusBadge = (status?: string | null) => {
  if (!status) return <span className="text-zinc-500">-</span>;
  const normalized = status.toUpperCase();
  const className =
    normalized === 'PENDING'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : normalized === 'APPROVED'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-red-200 bg-red-50 text-red-700';

  return <Badge className={className}>{normalized}</Badge>;
};

const renderCidImage = (src: string | null, label: string) => {
  if (!src) {
    return (
      <div className="mt-2 flex h-40 w-full items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
        {label}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      className="mt-2 h-40 w-full rounded-md border border-zinc-200 object-cover"
      loading="lazy"
    />
  );
};

const splitEvidenceString = (value?: string | null) => {
  if (!value) return [] as string[];
  return value
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function PendingOrgDetail({ user, userDetails, detail }: Props) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { trigger: verify, isMutating: isVerifying } = useVerifyOrgRegistration(
    {
      id: detail?.id || '',
      baseUrl: apiBaseUrl
    }
  );

  const handleApprove = async () => {
    if (!detail?.id) return;
    try {
      await verify({ approve: true, rejectionReason: null });
      setOpenApproveModal(false);
      toast.success('Đã phê duyệt tổ chức.');
      router.refresh();
      router.back();
    } catch (error) {
      setOpenApproveModal(false);
      toast.error('Không thể phê duyệt', {
        description:
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
      });
      console.error('Approve organization error:', error);
    }
  };

  const handleReject = async () => {
    if (!detail?.id) return;
    const reason = rejectReason.trim();
    if (!reason) return;

    try {
      await verify({ approve: false, rejectionReason: reason });
      setOpenRejectModal(false);
      setRejectReason('');
      toast.success('Đã từ chối tổ chức.');
      router.refresh();
      router.back();
    } catch (error) {
      setOpenRejectModal(false);
      toast.error('Không thể từ chối', {
        description:
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
      });
      console.error('Reject organization error:', error);
    }
  };

  const evidenceUrls = detail?.otherEvidencesUrls ?? [];
  const organizationEvidenceUrls = splitEvidenceString(
    detail?.organization?.otherEvidences
  );
  const mergedEvidenceUrls = Array.from(
    new Set([...evidenceUrls, ...organizationEvidenceUrls])
  );

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Chi tiết tổ chức"
      description="Thông tin chi tiết tổ chức chờ phê duyệt"
    >
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mt-2 text-zinc-500">
              Thông tin chi tiết tổ chức chờ phê duyệt
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
            onClick={() => router.push('/dashboard/pending-orgs')}
          >
            Quay lại
          </Button>
        </div>

        {!detail ? (
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-zinc-600">Không tìm thấy tổ chức.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Thông tin tổ chức
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Tên tổ chức</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.name)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Loại tổ chức</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.orgType)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">DHA</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.dhaRegistered)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Trạng thái</p>
                  <div className="mt-1">{renderStatusBadge(detail.status)}</div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-sm text-zinc-500">Giới thiệu</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.orgIntroduction)}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-sm text-zinc-500">Lý do đăng ký</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.applicationReason)}
                  </p>
                </div>
                {detail.rejectionReason ? (
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-sm text-zinc-500">Lý do từ chối</p>
                    <p className="text-sm text-zinc-700">
                      {renderValue(detail.rejectionReason)}
                    </p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Thông tin quản lý
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Họ tên</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.managerFullName)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">CCCD</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.managerCid)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Số điện thoại</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.managerPhone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.managerEmail)}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    CCCD mặt trước
                  </p>
                  {renderCidImage(detail.managerCidFrontUrl, 'CCCD mặt trước')}
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    CCCD mặt sau
                  </p>
                  {renderCidImage(detail.managerCidBackUrl, 'CCCD mặt sau')}
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    Ảnh cầm CCCD
                  </p>
                  {renderCidImage(detail.managerCidHoldingUrl, 'Ảnh cầm CCCD')}
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Thông tin duyệt
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Ngày tạo</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Ngày duyệt</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.reviewedAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Người duyệt</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(
                      detail.reviewedBy?.email || detail.reviewedBy?.id
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Ghi chú</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(detail.note)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Bằng chứng bổ sung
              </h2>
              {mergedEvidenceUrls.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-700">
                  Không có tệp đính kèm.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {mergedEvidenceUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setOpenRejectModal(true)}
                disabled={isVerifying || !detail?.id}
              >
                Từ chối
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setOpenApproveModal(true)}
                disabled={isVerifying || !detail?.id}
              >
                Phê duyệt
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
        <DialogContent className="bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Từ chối tổ chức</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để gửi lại cho tổ chức.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Lý do từ chối
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="min-h-[120px] w-full rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <DialogFooter>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => setOpenRejectModal(false)}
              disabled={isVerifying}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleReject}
              disabled={isVerifying || !rejectReason.trim()}
            >
              {isVerifying ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openApproveModal} onOpenChange={setOpenApproveModal}>
        <DialogContent className="bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Phê duyệt tổ chức</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn phê duyệt tổ chức này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setOpenApproveModal(false)}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isVerifying}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleApprove}
              disabled={isVerifying}
            >
              {isVerifying ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
