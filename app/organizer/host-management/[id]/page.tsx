'use client';

import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, BadgeCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout';
import { organizerRoutes } from '@/components/routes';
import { useViewHostInfo } from '@/hooks/features/uc066-view-host-details/useViewHostInfo';
import { useViewHostActivities } from '@/hooks/features/uc066-view-host-details/useViewHostActivities';
import { useState, useMemo } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return '-';
  }
};

const calculateHours = (
  startTime: string | null | undefined,
  endTime: string | null | undefined
): number => {
  if (!startTime || !endTime) return 0;
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
};

export default function HostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hostId = params?.id?.toString();
  const {
    data: hostInfo,
    isLoading,
    error
  } = useViewHostInfo({
    id: hostId,
    baseUrl: API_BASE_URL,
    enabled: Boolean(hostId)
  });

  const [showAllActivities, setShowAllActivities] = useState(false);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hourFilter, setHourFilter] = useState<'all' | '1-2' | '3-4' | '5plus'>(
    'all'
  );

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError
  } = useViewHostActivities({
    id: hostId,
    baseUrl: API_BASE_URL,
    enabled: Boolean(hostId),
    pageNumber: 0,
    pageSize: 100,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined
  });

  // Transform API activities to display format
  const activities = useMemo(() => {
    if (!activitiesData?.content) return [];
    return activitiesData.content.map((activity) => ({
      name: activity.eventName || 'Sự kiện không có tên',
      date: formatDate(activity.sessionStartTime),
      hours: calculateHours(activity.sessionStartTime, activity.sessionEndTime)
    }));
  }, [activitiesData]);

  const host = {
    id: hostInfo?.id || '',
    name: hostInfo?.fullName?.trim() || 'Chưa cập nhật',
    email: hostInfo?.email || '-',
    phone: hostInfo?.phone || '-',
    address: hostInfo?.address || '-',
    status: 'Hoạt động',
    dob: hostInfo?.dob ? formatDate(hostInfo.dob) : '-',
    cccd: hostInfo?.cid || '-',
    joined: formatDate(hostInfo?.createdAt),
    avatar: hostInfo?.avatarUrl
  };

  // Filtering logic
  const filteredActivities = activities.filter((act) => {
    // Filter by keyword
    const keywordMatch =
      !search || act.name.toLowerCase().includes(search.toLowerCase());
    // Filter by hours
    let hourOk = true;
    if (hourFilter === '1-2') hourOk = act.hours >= 1 && act.hours <= 2;
    else if (hourFilter === '3-4') hourOk = act.hours >= 3 && act.hours <= 4;
    else if (hourFilter === '5plus') hourOk = act.hours >= 5;
    return keywordMatch && hourOk;
  });

  const visibleActivities = showAllActivities
    ? filteredActivities
    : filteredActivities.slice(0, 3);

  const getHourButtonClass = (
    isActive: boolean,
    activeClass = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white'
  ) =>
    isActive
      ? activeClass
      : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800';

  return (
    <DashboardLayout
      title="Quản Lý Host"
      description="Chi tiết tài khoản Host"
      user={null}
      userDetails={null}
      routes={organizerRoutes}
      colorVariant="organizer"
      signInPath="/signin/password_signin"
    >
      <div className="w-full max-w-none">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div></div>
          <Button
            variant="outline"
            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            onClick={() => router.back()}
          >
            &larr; Quay lại
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-zinc-500">Đang tải thông tin host...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            Không thể tải thông tin host. Vui lòng thử lại.
          </div>
        )}

        {!isLoading && hostInfo && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-zinc-200 bg-white p-6 shadow-sm flex flex-row items-center gap-6">
                <Avatar className="h-24 w-24 text-3xl">
                  <AvatarFallback>
                    {host.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-semibold">{host.name}</span>
                    <Badge
                      className={
                        host.status === 'Hoạt động'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600'
                          : 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-50 hover:text-rose-500'
                      }
                    >
                      <span
                        className={
                          host.status === 'Hoạt động'
                            ? 'mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500'
                            : 'mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-400'
                        }
                      />
                      {host.status === 'Hoạt động'
                        ? 'Đang hoạt động'
                        : 'Đã khóa'}
                    </Badge>
                  </div>
                  <div className="text-sm text-zinc-500 mb-2">
                    <span>Địa chỉ:</span>{' '}
                    <span className="text-zinc-900 font-medium">
                      {host.address}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div>
                      <span className="text-zinc-500">Ngày sinh:</span>{' '}
                      <span className="text-zinc-900 font-medium">
                        {host.dob}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Ngày tham gia:</span>{' '}
                      <span className="text-zinc-900 font-medium">
                        {host.joined}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-center">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-500">Email:</span>{' '}
                    <span className="text-zinc-900 font-medium">
                      {host.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-500">Số điện thoại:</span>{' '}
                    <span className="text-zinc-900 font-medium">
                      {host.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-500">CCCD/CMND:</span>{' '}
                    <span className="text-zinc-900 font-medium">
                      {host.cccd}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-zinc-200 bg-white p-6 shadow-sm mt-8">
              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl mb-4">
                Lịch sử hoạt động gần đây
              </h2>
              <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <input
                  className="border border-zinc-200 rounded px-3 py-2 w-full md:w-1/2"
                  placeholder="Tìm kiếm hoạt động..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-zinc-200 rounded px-3 py-2 w-full md:w-1/4 text-zinc-700"
                  placeholder="Từ ngày"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-zinc-200 rounded px-3 py-2 w-full md:w-1/4 text-zinc-700"
                  placeholder="Đến ngày"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="w-full md:w-auto bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                  onClick={() => {
                    setSearch('');
                    setFromDate('');
                    setToDate('');
                    setHourFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
              <div className="mb-4 flex gap-2">
                <Button
                  variant="outline"
                  className={getHourButtonClass(hourFilter === 'all')}
                  onClick={() => setHourFilter('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant="outline"
                  className={getHourButtonClass(hourFilter === '1-2')}
                  onClick={() => setHourFilter('1-2')}
                >
                  1-2 giờ
                </Button>
                <Button
                  variant="outline"
                  className={getHourButtonClass(hourFilter === '3-4')}
                  onClick={() => setHourFilter('3-4')}
                >
                  3-4 giờ
                </Button>
                <Button
                  variant="outline"
                  className={getHourButtonClass(hourFilter === '5plus')}
                  onClick={() => setHourFilter('5plus')}
                >
                  5+ giờ
                </Button>
              </div>
              <div className="divide-y bg-white rounded-lg">
                {activitiesLoading && (
                  <div className="py-6 px-4 flex justify-center">
                    <p className="text-zinc-500">Đang tải hoạt động...</p>
                  </div>
                )}
                {activitiesError && (
                  <div className="py-6 px-4 text-center">
                    <p className="text-rose-500">
                      Không thể tải hoạt động. Vui lòng thử lại.
                    </p>
                  </div>
                )}
                {!activitiesLoading &&
                  !activitiesError &&
                  visibleActivities.length === 0 && (
                    <div className="py-6 px-4 text-center">
                      <p className="text-zinc-500">
                        Không tìm thấy hoạt động phù hợp
                      </p>
                    </div>
                  )}
                {visibleActivities.map((act, idx) => (
                  <div
                    key={idx}
                    className="py-3 px-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-zinc-900">
                        {act.name}
                      </div>
                      <div className="text-sm text-zinc-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 mr-0.5" />
                          {act.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 mr-0.5" />
                          {act.hours}h
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length > 3 && !showAllActivities && (
                  <div className="flex justify-center mt-6">
                    <span
                      className="cursor-pointer text-blue-700 hover:text-blue-800 hover:underline text-sm font-medium mt-5"
                      onClick={() => setShowAllActivities(true)}
                    >
                      Xem thêm
                    </span>
                  </div>
                )}
                {activities.length > 3 && showAllActivities && (
                  <div className="flex justify-center mt-6">
                    <span
                      className="cursor-pointer text-blue-700 hover:text-blue-800 hover:underline text-sm font-medium mt-5"
                      onClick={() => setShowAllActivities(false)}
                    >
                      Thu gọn
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
