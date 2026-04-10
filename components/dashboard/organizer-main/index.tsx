/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { organizerRoutes } from '@/components/routes';
import { User } from '@supabase/supabase-js';
import type { IRoute } from '@/types/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Clock3,
  ShieldAlert,
  Users
} from 'lucide-react';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null | any;
  title?: string;
  description?: string;
  routes?: IRoute[];
  signInPath?: string;
}

const managerKpis = [
  {
    label: 'Tổng Host đang quản lý',
    value: '42',
    detail: '36 hoạt động | 6 tạm khóa',
    icon: Users
  },
  {
    label: 'Tổng sự kiện của tổ chức',
    value: '128',
    detail: '17 đang diễn ra | 111 đã hoàn thành',
    icon: CalendarCheck
  },
  {
    label: 'Tổng giờ uy tín đã cấp',
    value: '18,640h',
    detail: '+9.4% so với tháng trước',
    icon: Clock3
  },
  {
    label: 'Rating trung bình',
    value: '4.6/5',
    detail: 'Tỷ lệ duyệt sự kiện: 84%',
    icon: Activity
  }
];

const managerTopHosts = [
  { name: 'Trần Đức Lợi', events: 18, hours: 420 },
  { name: 'Nguyễn Minh Châu', events: 15, hours: 366 },
  { name: 'Phạm Bảo Ngọc', events: 13, hours: 314 },
  { name: 'Lê Khánh Linh', events: 12, hours: 295 },
  { name: 'Võ Gia Hân', events: 10, hours: 248 }
];

const managerComplianceAlerts = [
  {
    type: 'No-show cao',
    message: 'Sự kiện Dọn sạch kênh Nhiêu Lộc có tỷ lệ vắng mặt 41%.',
    level: 'high'
  },
  {
    type: 'Đánh giá thấp',
    message: 'Host Trần Đức Lợi nhận 2 phản hồi 2 sao trong tuần này.',
    level: 'high'
  },
  {
    type: 'Đóng đơn trễ',
    message: '2 sự kiện đã quá hạn đóng đơn nhưng thiếu TNV.',
    level: 'medium'
  }
];

const managerRecentFeedback = [
  {
    event: 'Hiến máu nhân đạo quý II',
    rating: 2,
    note: 'Khâu điểm danh chậm, mất hơn 30 phút.'
  },
  {
    event: 'Ngày hội môi trường quận 7',
    rating: 5,
    note: 'Host hỗ trợ tốt, hoạt động rõ ràng.'
  },
  {
    event: 'Lớp phụ đạo cuối tuần',
    rating: 4,
    note: 'Nội dung tốt, cần thêm tài liệu trước buổi học.'
  }
];

const managerParticipationSeries = [
  {
    name: 'TNV tham gia',
    data: [160, 195, 210, 238, 260, 292, 315]
  }
];

const managerParticipationOptions: any = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#2563eb'],
  stroke: {
    width: 3,
    curve: 'smooth'
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#e4e4e7',
    strokeDashArray: 4
  },
  xaxis: {
    categories: ['T10', 'T11', 'T12', 'T1', 'T2', 'T3', 'T4'],
    labels: { style: { colors: '#52525b', fontWeight: 600 } }
  },
  yaxis: {
    labels: { style: { colors: '#52525b', fontWeight: 600 } }
  },
  tooltip: {
    theme: 'dark'
  }
};

const managerHostSeries = [
  {
    name: 'Số sự kiện hoàn thành',
    data: [18, 15, 13, 12, 10]
  },
  {
    name: 'Giờ tình nguyện (x10)',
    data: [42, 36, 31, 29, 24]
  }
];

const managerHostOptions: any = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#0f766e', '#1d4ed8'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '45%'
    }
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#e4e4e7'
  },
  xaxis: {
    categories: managerTopHosts.map(
      (host) => host.name.split(' ').slice(-1)[0]
    ),
    labels: { style: { colors: '#52525b', fontWeight: 600 } }
  },
  yaxis: {
    labels: { style: { colors: '#52525b', fontWeight: 600 } }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
};

export default function OrganizerMainDashboard(props: Props) {
  const organizationName =
    props.userDetails?.organization_name ||
    props.userDetails?.organizationName ||
    'Tổ chức của bạn';

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title={props.title ?? 'Bảng điều khiển tổ chức'}
      description={props.description ?? 'Hiệu suất vận hành và nhân sự nội bộ'}
      routes={props.routes ?? organizerRoutes}
      colorVariant="organizer"
      signInPath={props.signInPath ?? '/signin/password_signin'}
    >
      <div className="mx-auto w-full max-w-7xl pb-10">
        <Card className="border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Chào buổi sáng, Quản trị viên {organizationName}!
          </p>
          <p className="mt-1 text-lg font-bold text-zinc-900">
            Hôm nay bạn có {managerComplianceAlerts.length} cảnh báo tuân thủ
            cần theo dõi.
          </p>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {managerKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.label}
                className="border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-500">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950">
                      {kpi.value}
                    </p>
                    <p className="mt-2 text-xs font-medium text-zinc-600">
                      {kpi.detail}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                    <Icon className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">
                    Xu hướng TNV tham gia theo tháng
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Theo dõi mức độ thu hút TNV của tổ chức
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-zinc-300 text-zinc-700"
                >
                  BR-06
                </Badge>
              </div>
              <div className="h-[320px] w-full">
                <ApexChart
                  type="line"
                  options={managerParticipationOptions}
                  series={managerParticipationSeries}
                  height="100%"
                  width="100%"
                />
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-4">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-700" />
                <h3 className="text-lg font-bold text-zinc-950">
                  Hiệu suất Host
                </h3>
              </div>
              <div className="h-[320px] w-full">
                <ApexChart
                  type="bar"
                  options={managerHostOptions}
                  series={managerHostSeries}
                  height="100%"
                  width="100%"
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-7">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-zinc-700" />
                <h3 className="text-lg font-bold text-zinc-950">
                  Cảnh báo tuân thủ
                </h3>
              </div>

              <div className="space-y-2">
                {managerComplianceAlerts.map((alert) => (
                  <div
                    key={alert.message}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900">
                        {alert.type}
                      </p>
                      <Badge
                        className={
                          alert.level === 'high'
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }
                      >
                        {alert.level === 'high' ? 'Cao' : 'Trung bình'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Rating & Feedback gần nhất
                </p>
                <div className="mt-2 space-y-2">
                  {managerRecentFeedback.map((feedback) => (
                    <div
                      key={`${feedback.event}-${feedback.note}`}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900">
                          {feedback.event}
                        </p>
                        <Badge
                          className={
                            feedback.rating <= 2
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                              : feedback.rating === 3
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          }
                        >
                          {feedback.rating} sao
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">
                        {feedback.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-5">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-zinc-700" />
                <h3 className="text-lg font-bold text-zinc-950">
                  Host tiêu biểu
                </h3>
              </div>
              <div className="space-y-2">
                {managerTopHosts.map((host, idx) => (
                  <div
                    key={host.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {host.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {host.hours} giờ TNV
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-zinc-300 text-zinc-700"
                    >
                      {host.events} sự kiện
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
