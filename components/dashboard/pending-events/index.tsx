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

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const mockPendingEvents = [
  {
    id: 1,
    eventName: 'Chương trình tình nguyện môi trường',
    organizer: 'Tổ chức Xanh Việt',
    date: '15/03/2026',
    location: 'Công viên Tao Đàn, TPHCM',
    volunteers: 45,
    submittedDate: '10/02/2026',
    status: 'Chờ phê duyệt'
  },
  {
    id: 2,
    eventName: 'Hỗ trợ cộng đồng địa phương',
    organizer: 'Hội chữ Thập Đỏ',
    date: '22/03/2026',
    location: 'Huyện Nhà Bè',
    volunteers: 30,
    submittedDate: '05/02/2026',
    status: 'Chờ phê duyệt'
  },
  {
    id: 3,
    eventName: 'Giáo dục cho trẻ em vùng cao',
    organizer: 'Quỹ Phúc Lợi Xã Hội',
    date: '28/03/2026',
    location: 'Tỉnh Yên Bái',
    volunteers: 60,
    submittedDate: '01/02/2026',
    status: 'Chờ phê duyệt'
  }
];

export default function PendingEvents({ user, userDetails }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredEvents = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase();
    return mockPendingEvents.filter((event) => {
      const matchesSearch =
        event.eventName.toLowerCase().includes(searchTerm) ||
        event.organizer.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm);
      return event.status === 'Chờ phê duyệt' && matchesSearch;
    });
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Sự kiện chờ phê duyệt"
      description="Danh sách các sự kiện đang chờ phê duyệt"
    >
      <div className="w-full max-w-none">
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-blue-200 bg-blue-50"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="text-gray-700">Tên sự kiện</TableHead>
                <TableHead className="text-gray-700">Tổ chức</TableHead>
                <TableHead className="text-gray-700">Địa điểm</TableHead>
                <TableHead className="text-gray-700">Ngày diễn ra</TableHead>
                <TableHead className="text-gray-700">Ngày nộp</TableHead>
                <TableHead className="text-gray-700">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer border-b border-gray-200 hover:bg-blue-50"
                    onClick={() =>
                      router.push(`/dashboard/pending-events/${event.id}`)
                    }
                  >
                    <TableCell className="font-medium text-gray-900">
                      {event.eventName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {event.organizer}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {event.location}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {event.date}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {event.submittedDate}
                    </TableCell>
                    <TableCell>
                      <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                        {event.status}
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
                    Không có sự kiện chờ phê duyệt
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
