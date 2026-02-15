'use client';

import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  usePendingAccounts,
  type PendingAccountsResponse
} from '@/hooks/features/uc044-identity-verification/usePendingAccountsList';
import { ACCOUNT_STATUS } from '@/constants/account-status';

interface PendingAccountItem {
  id: string;
  email: string | null;
  phone: string | null;
  cid: string | null;
  status: string | null;
  createdAt: string | null;
}

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  accounts: PendingAccountItem[];
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export default function PendingAccounts({ user, userDetails }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = usePendingAccounts({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    status: ACCOUNT_STATUS.PENDING,
    email: searchQuery,
    baseUrl: apiBaseUrl
  });

  const effectiveAccounts = useMemo<PendingAccountItem[]>(() => {
    if (!data?.content) return [];
    return data.content.map((item) => ({
      id: item.id,
      email: item.email ?? null,
      phone: null,
      cid: item.cid ?? null,
      status: item.status ?? null,
      createdAt: item.createdAt ?? null
    }));
  }, [data]);

  const filteredAccounts = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase();
    return effectiveAccounts.filter((account) => {
      const matchesSearch =
        account.id.toLowerCase().includes(searchTerm) ||
        (account.email || '').toLowerCase().includes(searchTerm) ||
        (account.phone || '').toLowerCase().includes(searchTerm) ||
        (account.cid || '').toLowerCase().includes(searchTerm);
      return account.status === ACCOUNT_STATUS.PENDING && matchesSearch;
    });
  }, [effectiveAccounts, searchQuery]);

  const totalPages = data?.page?.totalPages
    ? Math.max(1, data.page.totalPages)
    : Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredAccounts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Tài khoản chờ phê duyệt"
      description="Danh sách các tài khoản đang chờ phê duyệt"
    >
      <div className="w-full max-w-none">
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm tài khoản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-blue-200 bg-blue-50"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="w-40 text-gray-700">ID</TableHead>
                <TableHead className="w-56 text-gray-700">Email</TableHead>
                <TableHead className="w-36 text-gray-700">Số CCCD</TableHead>
                <TableHead className="w-40 text-gray-700">Vai trò</TableHead>
                <TableHead className="w-28 text-gray-700">Ngày nộp</TableHead>
                <TableHead className="w-32 text-gray-700">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-red-500"
                  >
                    Không thể tải dữ liệu. Vui lòng thử lại.
                  </TableCell>
                </TableRow>
              ) : paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((account) => (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer border-b border-gray-200 hover:bg-blue-50"
                    onClick={() =>
                      router.push(`/dashboard/pending-accounts/${account.id}`)
                    }
                  >
                    <TableCell
                      className="w-40 max-w-[10rem] truncate font-medium text-gray-900"
                      title={account.id}
                    >
                      {account.id}
                    </TableCell>
                    <TableCell
                      className="w-56 max-w-[14rem] truncate text-gray-600"
                      title={account.email || ''}
                    >
                      {account.email || '-'}
                    </TableCell>
                    <TableCell className="w-36 text-gray-600">
                      {account.cid || '-'}
                    </TableCell>
                    <TableCell className="w-40 text-gray-600">
                      Tình nguyện viên
                    </TableCell>
                    <TableCell className="w-28 text-gray-600">
                      {formatDate(account.createdAt)}
                    </TableCell>
                    <TableCell className="w-32">
                      <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                        {account.status === ACCOUNT_STATUS.PENDING
                          ? 'Chờ phê duyệt'
                          : account.status || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    Không có tài khoản chờ phê duyệt
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
