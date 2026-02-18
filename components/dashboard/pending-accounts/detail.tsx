'use client';

import DashboardLayout from '@/components/layout';
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
import { useVerifyIdentity } from '@/hooks/features/uc044-identity-verification/useVerifyIdentity';
import type { PendingAccountVerification } from '@/hooks/entity';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  verification: PendingAccountVerification | null;
}

const renderValue = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return String(value);
};

const placeholderImages = {
  front:
    'https://images.unsplash.com/photo-1523287562758-66c7fc58967f?auto=format&fit=crop&w=600&q=80',
  back: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80',
  holding:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
};

export default function PendingAccountDetail({
  user,
  userDetails,
  verification
}: Props) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [accountName, setAccountName] = useState('');
  const isApproveEnabled = accountName.trim().length > 0;

  const { trigger: verify, isMutating: isVerifying } = useVerifyIdentity({
    id: verification?.id || '',
    baseUrl: apiBaseUrl
  });

  const handleApprove = async () => {
    try {
      await verify(
        {
          approve: true,
          rejectionReason: null,
          fullName: accountName
        },
        { throwOnError: true }
      );
      setOpenApproveModal(false);
      toast.success('Đã phê duyệt tài khoản.');
      router.refresh();
      router.push('/dashboard/pending-accounts');
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
      await verify(
        {
          approve: false,
          rejectionReason: rejectReason,
          fullName: accountName
        },
        { throwOnError: true }
      );
      setOpenRejectModal(false);
      setRejectReason('');
      toast.success('Đã từ chối tài khoản.');
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
            <p className="mt-2 text-gray-600">
              Thông tin chi tiết tài khoản chờ phê duyệt
            </p>
          </div>
          <Button
            variant="outline"
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            onClick={() => router.push('/dashboard/pending-accounts')}
          >
            Quay lại
          </Button>
        </div>

        {!verification ? (
          <Card className="border-zinc-200 bg-white p-6 dark:border-zinc-800">
            <p className="text-gray-600">Không tìm thấy tài khoản.</p>
          </Card>
        ) : (
          <Card className="border-zinc-200 p-6 dark:border-zinc-800">
            <div className="grid gap-6">
              <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    Thông tin chi tiết
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Số căn cước công dân
                  </p>
                  <p className="mt-1 text-gray-700">
                    {renderValue(verification.cid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Số điện thoại
                  </p>
                  <p className="mt-1 text-gray-700">
                    {renderValue(verification.phone)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600">Email</p>
                  <p className="mt-1 text-gray-700">
                    {renderValue(verification.email)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-red-600">
                    Tên tài khoản
                  </label>
                  <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Nhập tên tài khoản"
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg p-2">
                    <p className="text-xs font-medium text-zinc-600">
                      CCCD mặt trước
                    </p>
                    <img
                      src={verification.cid_front || placeholderImages.front}
                      alt="CCCD mặt trước"
                      className="mt-2 h-40 w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="rounded-lg p-2">
                    <p className="text-xs font-medium text-zinc-600">
                      CCCD mặt sau
                    </p>
                    <img
                      src={verification.cid_back || placeholderImages.back}
                      alt="CCCD mặt sau"
                      className="mt-2 h-40 w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="rounded-lg p-2">
                    <p className="text-xs font-medium text-zinc-600">
                      Ảnh cầm CCCD
                    </p>
                    <img
                      src={
                        verification.cid_holding || placeholderImages.holding
                      }
                      alt="Ảnh cầm CCCD"
                      className="mt-2 h-40 w-full rounded-md object-cover"
                    />
                  </div>
                </div>
              </div>

              {verification.note ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    Ghi chú
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-gray-700">
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
                  className="bg-blue-600 hover:bg-blue-700"
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
          </Card>
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
              className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              onClick={() => setOpenRejectModal(false)}
              disabled={isVerifying}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
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
              className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              disabled={isVerifying}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
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
