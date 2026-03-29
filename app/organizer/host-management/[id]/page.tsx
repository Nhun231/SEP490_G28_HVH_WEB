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

const HOSTS = [
  {
    id: '1',
    name: 'Bùi Minh Tuấn',
    email: 'buiminhtuan@email.com',
    phone: '0990123456',
    address: 'Quận Nam Từ Liêm, Hà Nội',
    status: 'Hoạt động',
    dob: '09/09/1996',
    cccd: '001204031234',
    joined: '14/09/2020',
    avatar: null,
    activities: [
      {
        name: 'Chăm sóc người cao tuổi tại viện dưỡng lão',
        date: '15/12/2024',
        hours: 4
      },
      {
        name: 'Dạy học miễn phí cho trẻ em vùng cao',
        date: '10/12/2024',
        hours: 3
      },
      { name: 'Làm sạch môi trường bãi biển', date: '05/12/2024', hours: 5 },
      { name: 'Hỗ trợ phát quà cho người nghèo', date: '01/12/2024', hours: 3 },
      {
        name: 'Tổ chức lớp học tiếng Anh miễn phí',
        date: '28/11/2024',
        hours: 2
      }
    ]
  }
];

import { useState } from 'react';

export default function HostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hostId = params?.id?.toString() || '1';
  const host = HOSTS.find((h) => h.id === hostId) || HOSTS[0];
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hourFilter, setHourFilter] = useState<'all' | '1-2' | '3-4' | '5plus'>(
    'all'
  );

  // Filtering logic
  const filteredActivities = host.activities.filter((act) => {
    // Filter by keyword
    const keywordMatch =
      !search || act.name.toLowerCase().includes(search.toLowerCase());
    // Filter by date
    const dateValue = act.date.split('/').reverse().join('-'); // dd/MM/yyyy -> yyyy-MM-dd
    const fromOk = !fromDate || dateValue >= fromDate;
    const toOk = !toDate || dateValue <= toDate;
    // Filter by hours
    let hourOk = true;
    if (hourFilter === '1-2') hourOk = act.hours >= 1 && act.hours <= 2;
    else if (hourFilter === '3-4') hourOk = act.hours >= 3 && act.hours <= 4;
    else if (hourFilter === '5plus') hourOk = act.hours >= 5;
    return keywordMatch && fromOk && toOk && hourOk;
  });

  const visibleActivities = showAllActivities
    ? filteredActivities
    : filteredActivities.slice(0, 3);

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
            className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
            onClick={() => router.back()}
          >
            &larr; Quay lại
          </Button>
        </div>

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
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-rose-200 bg-rose-50 text-rose-500'
                  }
                >
                  <span
                    className={
                      host.status === 'Hoạt động'
                        ? 'mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500'
                        : 'mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-400'
                    }
                  />
                  {host.status === 'Hoạt động' ? 'Đang hoạt động' : 'Đã khóa'}
                </Badge>
              </div>
              <div className="text-sm text-zinc-500 mb-2">{host.address}</div>
              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="text-zinc-500">Ngày sinh:</span> {host.dob}
                </div>
                <div>
                  <span className="text-zinc-500">Ngày tham gia:</span>{' '}
                  {host.joined}
                </div>
              </div>
            </div>
          </Card>
          <Card className="border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-center">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">Email:</span>{' '}
                <span className="text-zinc-900 font-medium">{host.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">Số điện thoại:</span>{' '}
                <span className="text-zinc-900 font-medium">{host.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">CCCD/CMND:</span>{' '}
                <span className="text-zinc-900 font-medium">{host.cccd}</span>
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
              variant={hourFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setHourFilter('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={hourFilter === '1-2' ? 'secondary' : 'ghost'}
              onClick={() => setHourFilter('1-2')}
            >
              1-2 giờ
            </Button>
            <Button
              variant={hourFilter === '3-4' ? 'secondary' : 'ghost'}
              onClick={() => setHourFilter('3-4')}
            >
              3-4 giờ
            </Button>
            <Button
              variant={hourFilter === '5plus' ? 'secondary' : 'ghost'}
              onClick={() => setHourFilter('5plus')}
            >
              5+ giờ
            </Button>
          </div>
          <div className="divide-y bg-white rounded-lg">
            {visibleActivities.map((act, idx) => (
              <div
                key={idx}
                className="py-3 px-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-zinc-900">{act.name}</div>
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
            {host.activities.length > 3 && !showAllActivities && (
              <div className="flex justify-center mt-6">
                <span
                  className="cursor-pointer text-blue-600 hover:underline text-sm font-medium mt-5"
                  onClick={() => setShowAllActivities(true)}
                >
                  Xem thêm
                </span>
              </div>
            )}
            {host.activities.length > 3 && showAllActivities && (
              <div className="flex justify-center mt-6">
                <span
                  className="cursor-pointer text-blue-600 hover:underline text-sm font-medium mt-5"
                  onClick={() => setShowAllActivities(false)}
                >
                  Thu gọn
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
