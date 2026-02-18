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
import { useOrgRegistrationsList } from '@/hooks/features/uc040-approve-reject-organization/useOrgRegistrationsList';
import type { OrgRegistrationItem } from '@/hooks/entity';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const renderYesNo = (value: boolean | null) => {
  if (value === null || value === undefined) return '-';
  return value ? 'Có' : 'Không';
};

export default function PendingOrgs({ user, userDetails }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = useOrgRegistrationsList({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    status: 'PENDING',
    email: searchQuery,
    baseUrl: apiBaseUrl
  });

  const organizations = useMemo<OrgRegistrationItem[]>(() => {
    if (!data?.content) return [];
    return data.content.map((item) => ({
      id: item.id,
      name: item.name ?? null,
      dhaRegistered: item.dhaRegistered ?? null,
      orgType: item.orgType ?? null,
      managerFullName: item.managerFullName ?? null,
      managerCid: item.managerCid ?? null,
      managerEmail: item.managerEmail ?? null
    }));
  }, [data]);

  const totalPages = data?.page?.totalPages
    ? Math.max(1, data.page.totalPages)
    : Math.max(1, Math.ceil(organizations.length / pageSize));

  const paginatedOrgs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return organizations.slice(startIndex, startIndex + pageSize);
  }, [currentPage, organizations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Tổ chức chờ phê duyệt"
      description="Danh sách các tổ chức đang chờ phê duyệt"
    >
      <div className="w-full max-w-none">
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm email quản lý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-blue-200 bg-blue-50"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="text-gray-700">ID</TableHead>
                <TableHead className="text-gray-700">Tên tổ chức</TableHead>
                <TableHead className="text-gray-700">Loại tổ chức</TableHead>
                <TableHead className="text-gray-700">DHA</TableHead>
                <TableHead className="text-gray-700">Quản lý</TableHead>
                <TableHead className="text-gray-700">CCCD</TableHead>
                <TableHead className="text-gray-700">Email</TableHead>
                <TableHead className="text-gray-700">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-red-500"
                  >
                    Không thể tải dữ liệu. Vui lòng thử lại.
                  </TableCell>
                </TableRow>
              ) : paginatedOrgs.length > 0 ? (
                paginatedOrgs.map((org) => (
                  <TableRow
                    key={org.id}
                    className="cursor-pointer border-b border-gray-200 hover:bg-blue-50"
                    onClick={() =>
                      router.push(`/dashboard/pending-orgs/${org.id}`)
                    }
                  >
                    <TableCell className="font-medium text-gray-900">
                      {org.id}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {org.name || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {org.orgType || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {renderYesNo(org.dhaRegistered)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {org.managerFullName || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {org.managerCid || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {org.managerEmail || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                        PENDING
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-gray-500"
                  >
                    Không có tổ chức chờ phê duyệt
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
