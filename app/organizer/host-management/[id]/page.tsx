'use client';

import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, BadgeCheck, ShieldCheck, UserRound } from 'lucide-react';
import DashboardLayout from '@/components/layout';
import { organizerRoutes } from '@/components/routes';
import { useViewHostInfo } from '@/hooks/features/sys-admin/uc066-view-host-details/useViewHostInfo';
import { useViewHostActivities } from '@/hooks/features/sys-admin/uc066-view-host-details/useViewHostActivities';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

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

  const hostInitials =
    host.name && host.name.length > 0
      ? host.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : host.email.charAt(0).toUpperCase();

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
      <div className="mx-auto w-full max-w-6xl pb-16 pt-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mt-2 text-zinc-500">
              Thông tin chi tiết tài khoản host
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
            onClick={() => router.back()}
          >
            Quay lại
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
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Card className="border-zinc-200 bg-white p-6 shadow-sm xl:col-span-1">
                <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border border-white shadow-sm">
                      <AvatarImage src={host.avatar} />
                      <AvatarFallback className="bg-sky-100 text-xl font-bold text-sky-700">
                        {hostInitials || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-extrabold text-zinc-900">
                        {host.name}
                      </p>
                      <p className="mt-1 truncate text-sm text-zinc-600">
                        {host.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                      {host.status === 'Hoạt động'
                        ? 'Đang hoạt động'
                        : 'Đã khóa'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-zinc-300 text-zinc-600"
                    >
                      Host
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Địa chỉ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {host.address}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Ngày sinh
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {host.dob}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Ngày tham gia
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {host.joined}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-zinc-900">
                    Thông tin tài khoản
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Host ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-zinc-900">
                      {host.id || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      Căn cước công dân
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {host.cccd}
                    </p>
                  </div>
                </div>

                <div className="my-6 h-px bg-zinc-200" />

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <UserRound className="h-4 w-4 text-zinc-500" />
                      Họ và tên
                    </label>
                    <Input
                      type="text"
                      value={host.name}
                      disabled
                      className="border-zinc-300 bg-white text-zinc-900 disabled:opacity-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      Email
                    </label>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {host.email}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Email không cho phép cập nhật tại đây.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      Số điện thoại
                    </label>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {host.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                      Trạng thái tài khoản
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {host.status === 'Hoạt động'
                        ? 'Tài khoản host đang hoạt động.'
                        : 'Tài khoản host đã bị khóa.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                      <BadgeCheck className="h-4 w-4 text-zinc-500" />
                      Định danh
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Số Căn cước công dân: {host.cccd}
                    </p>
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
