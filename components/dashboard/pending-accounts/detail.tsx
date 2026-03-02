/* eslint-disable @next/next/no-img-element */

'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useVerifyIdentity } from '@/hooks/features/uc044-identity-verification/useVerifyIdentity';
import type { PendingAccountVerification } from '@/hooks/entity';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  verification: PendingAccountVerification | null;
  defaultFullName?: string | null;
}

const renderValue = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return String(value);
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

export default function PendingAccountDetail({
  user,
  userDetails,
  verification,
  defaultFullName = null
}: Props) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [accountName, setAccountName] = useState(defaultFullName ?? '');
  const isApproveEnabled = accountName.trim().length > 0;

  useEffect(() => {
    setAccountName(defaultFullName ?? '');
  }, [defaultFullName, verification?.id]);

  const { trigger: verify, isMutating: isVerifying } = useVerifyIdentity({
    id: verification?.id || '',
    baseUrl: apiBaseUrl
  });

  const handleApprove = async () => {
    try {
      const response = await verify(
        {
          approve: true,
          rejectionReason: null,
          fullName: accountName
        },
        { throwOnError: true }
      );
      setOpenApproveModal(false);
      toast.success(response?.message ?? 'Đã phê duyệt tài khoản.');
      router.refresh();
      router.back();
    } catch (error) {
      setOpenApproveModal(false);
      toast.error('Không thể phê duyệt', {
        description:
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
      });
      console.error('Approve error:', error);
    }
  };

  const handleReject = async () => {
    try {
      const rejectPayload: any = {
        approve: false,
        rejectionReason: rejectReason
      };
      if (accountName.trim()) {
        rejectPayload.fullName = accountName;
      }
      const response = await verify(rejectPayload, { throwOnError: true });
      setOpenRejectModal(false);
      setRejectReason('');
      toast.success(response?.message ?? 'Đã từ chối tài khoản.');
      router.refresh();
      router.push('/dashboard/pending-accounts');
    } catch (error) {
      setOpenRejectModal(false);
      toast.error('Không thể từ chối', {
        description:
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
      });
      console.error('Reject error:', error);
    }
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Chi tiết tài khoản"
      description="Thông tin chi tiết tài khoản chờ phê duyệt"
    >
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mt-2 text-zinc-500">
              Thông tin chi tiết tài khoản chờ phê duyệt
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
            onClick={() => router.push('/dashboard/pending-accounts')}
          >
            Quay lại
          </Button>
        </div>

        {!verification ? (
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-zinc-600">Không tìm thấy tài khoản.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Thông tin tài khoản
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Số căn cước công dân</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(verification.cid)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Số điện thoại</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(verification.phone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="text-sm text-zinc-700">
                    {renderValue(verification.email)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Trạng thái</p>
                  <p className="text-sm text-zinc-700">Chờ phê duyệt</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-zinc-700">
                    Tên tài khoản
                  </p>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Nhập tên tài khoản"
                    className="bg-white border-primary/40 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                Ảnh CCCD
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    CCCD mặt trước
                  </p>
                  {renderCidImage(verification.cid_front, 'CCCD mặt trước')}
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    CCCD mặt sau
                  </p>
                  {renderCidImage(verification.cid_back, 'CCCD mặt sau')}
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    Ảnh cầm CCCD
                  </p>
                  {renderCidImage(verification.cid_holding, 'Ảnh cầm CCCD')}
                </div>
              </div>
            </Card>

            {verification.note ? (
              <div className="relative overflow-hidden rounded-md border border-amber-200 bg-amber-50 p-6 pt-10 text-amber-950">
                <div className="pointer-events-none absolute left-1/2 top-0 h-6 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-sm border border-amber-400/30 bg-amber-300/70 shadow-sm" />

                <h2 className="text-xl font-semibold leading-snug tracking-tight text-amber-950 md:text-3xl">
                  Ghi chú
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-amber-950/90">
                  {verification.note}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setOpenRejectModal(true)}
                disabled={isVerifying}
              >
                Từ chối
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setOpenApproveModal(true)}
                disabled={!isApproveEnabled || isVerifying}
                title={
                  isApproveEnabled ? undefined : 'Vui lòng nhập tên tài khoản'
                }
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
            <DialogTitle className="text-black">Từ chối tài khoản</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để gửi lại cho người dùng.
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
            <DialogTitle className="text-black">
              Phê duyệt tài khoản
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn phê duyệt tài khoản này không?
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
