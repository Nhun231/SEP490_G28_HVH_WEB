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
  Award,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Clock3,
  TrendingUp,
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

const monthlyGrowthOptions: any = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#ef4444', '#0f766e', '#2563eb'],
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
    labels: { style: { colors: '#52525b', fontWeight: 600 } }
  },
  yaxis: [
    {
      seriesName: 'Tỷ lệ vắng mặt (%)',
      title: {
        text: 'Tỷ lệ vắng mặt (%)',
        style: { color: '#ef4444' }
      },
      labels: {
        style: { colors: '#52525b', fontWeight: 600 },
        formatter: (value: number) => `${value}%`
      }
    },
    {
      seriesName: 'Số sự kiện hoàn thành',
      opposite: true,
      title: {
        text: 'Số sự kiện',
        style: { color: '#0f766e' }
      },
      labels: { style: { colors: '#52525b', fontWeight: 600 } }
    },
    {
      seriesName: 'Số giờ tích lũy',
      opposite: true,
      show: false,
      labels: {
        style: { colors: '#52525b', fontWeight: 600 },
        formatter: (value: number) => `${value}h`
      }
    }
  ],
  tooltip: {
    theme: 'dark',
    y: {
      formatter: function (val: number, { seriesIndex }: { seriesIndex: number }) {
        if (seriesIndex === 0) return `${val}%`;
        if (seriesIndex === 2) return `${val} giờ`;
        return val;
      }
    }
  }
}

interface MonthlyStat {
  year: number;
  month: number;
  completedEvents: number;
  creditHours: number;
  approvedApplications: number;
  attendedApplications: number;
  topHostPayloads: Array<{
    hostId: string;
    fullName: string;
    email: string;
    totalEvent: number;
    totalCreditHour: number;
  }>;
}

const safeNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const firstNumber = (
  source: Record<string, any> | null | undefined,
  keys: string[],
  fallback = 0
) => {
  if (!source) return fallback;

  for (const key of keys) {
    const nextValue = source[key];
    const normalized = safeNumber(nextValue);
    if (normalized !== 0 || nextValue === 0) {
      return normalized;
    }
  }

  return fallback;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

const getVietnamGreeting = () => {
  const currentHour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(new Date())
  );

  if (currentHour >= 5 && currentHour < 12) {
    return 'Chào buổi sáng';
  }

  if (currentHour >= 12 && currentHour < 18) {
    return 'Chào buổi chiều';
  }

  return 'Chào buổi tối';
};

export default function OrganizerMainDashboard(props: Props) {
  const organizationName =
    props.userDetails?.organization_name ||
    props.userDetails?.organizationName ||
    'Tổ chức của bạn';
  const greeting = getVietnamGreeting();
  const displayName =
    props.user?.user_metadata?.username ||
    props.user?.user_metadata?.full_name ||
    props.user?.email?.split('@')[0] ||
    organizationName;

  const totalHosts = firstNumber(props.userDetails, [
    'totalHosts',
    'hostCount',
    'hostsCount'
  ]);
  const totalEvents = firstNumber(props.userDetails, [
    'hostedEventCount',
    'totalEvents',
    'eventCount'
  ]);
  const activeEvents = firstNumber(props.userDetails, [
    'ongoingEventCount',
    'activeEventCount',
    'currentEventCount'
  ]);
  const endedEventsThisMonth = firstNumber(
    props.userDetails,
    [
      'endedEventsThisMonth',
      'endedEventCountThisMonth',
      'finishedEventCountThisMonth',
      'monthlyEndedEventCount'
    ],
    0
  );
  const monthlyApplications = firstNumber(props.userDetails, [
    'monthlyApplicationCount',
    'applicationCountThisMonth',
    'applicationsThisMonth'
  ]);
  const monthlyAttendedApplications = firstNumber(props.userDetails, [
    'monthlyAttendedApplicationCount',
    'attendedApplicationCountThisMonth',
    'attendedApplicationsThisMonth'
  ]);
  const monthlyCreditHour = firstNumber(props.userDetails, [
    'monthlyCreditHour',
    'creditHourThisMonth',
    'monthlyHours'
  ]);
  const recruitingEventsCount = firstNumber(props.userDetails, [
    'recruitingEventsCount'
  ]);
  const upcomingEventsCount = firstNumber(props.userDetails, [
    'upcomingEventsCount'
  ]);
  const ongoingEventsCount = firstNumber(props.userDetails, [
    'ongoingEventsCount',
    'activeEventCount',
    'currentEventCount'
  ]);
  const avgRating = firstNumber(props.userDetails, [
    'avgRating',
    'averageRating',
    'rating'
  ]);

  // Lấy dữ liệu thống kê tháng từ BE
  const monthlyStats = (
    Array.isArray(props.userDetails?.monthlyStats)
      ? props.userDetails.monthlyStats
      : []
  ) as MonthlyStat[];

  // Sắp xếp theo thời gian (cũ -> mới) để hiển thị biểu đồ
  const sortedMonthlyStats = [...monthlyStats].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Tính tỷ lệ vắng mặt
  const calculateAbsenceRate = (stat: MonthlyStat) => {
    if (stat.approvedApplications === 0) return 0;
    const absent = stat.approvedApplications - stat.attendedApplications;
    return Number(((absent / stat.approvedApplications) * 100).toFixed(1));
  };

  // Tạo series cho biểu đồ (lấy 6 tháng gần nhất)
  const last6Months = sortedMonthlyStats.slice(-6);
  const monthlyGrowthSeries = [
    {
      name: 'Tỷ lệ vắng mặt (%)',
      data: last6Months.map(calculateAbsenceRate)
    },
    {
      name: 'Số sự kiện hoàn thành',
      data: last6Months.map((s) => s.completedEvents)
    },
    {
      name: 'Số giờ tích lũy',
      data: last6Months.map((s) => s.creditHours)
    }
  ];

  // Format label tháng (T1, T2, ...)
  const monthLabels = last6Months.map(
    (s) => `T${s.month}`
  );

  // Lấy top hosts của tháng hiện tại (tháng mới nhất)
  const currentMonthStat = monthlyStats[0];
  const topHosts = currentMonthStat?.topHostPayloads || [];

  // Chuyển đổi sang format hiển thị và sắp xếp theo số sự kiện
  const sortedTopHosts = topHosts
    .map((h) => ({
      name: h.fullName,
      events: h.totalEvent,
      hours: h.totalCreditHour
    }))
    .sort((a, b) => b.events - a.events);

  const metricCards = [
    {
      label: 'Số sự kiện đang tuyển quân',
      value: formatNumber(recruitingEventsCount),
      detail:
        recruitingEventsCount > 0
          ? 'Các sự kiện đang mở đơn đăng ký'
          : 'Chưa có sự kiện tuyển quân',
      icon: Users,
      cardClass: 'from-emerald-50 to-white',
      iconClass: 'text-emerald-700'
    },
    {
      label: 'Số sự kiện sắp diễn ra',
      value: formatNumber(upcomingEventsCount),
      detail:
        upcomingEventsCount > 0
          ? 'Các sự kiện đã lên lịch trong thời gian tới'
          : 'Chưa có sự kiện sắp diễn ra',
      icon: CalendarCheck,
      cardClass: 'from-sky-50 to-white',
      iconClass: 'text-sky-700'
    },
    {
      label: 'Số sự kiện đang diễn ra',
      value: formatNumber(ongoingEventsCount),
      detail:
        ongoingEventsCount > 0
          ? 'Sự kiện đang được theo dõi theo thời gian thực'
          : 'Chưa có sự kiện đang diễn ra',
      icon: ClipboardList,
      cardClass: 'from-violet-50 to-white',
      iconClass: 'text-violet-700'
    },
    {
      label: 'Số sự kiện đã kết thúc trong tháng',
      value: formatNumber(endedEventsThisMonth),
      detail:
        endedEventsThisMonth > 0
          ? `Tổng sự kiện của tổ chức: ${formatNumber(totalEvents)}`
          : 'Chưa có số liệu tháng này',
      icon: BarChart3,
      cardClass: 'from-indigo-50 to-white',
      iconClass: 'text-indigo-700'
    },
    {
      label: 'Số giờ uy tín trong tháng',
      value: `${formatNumber(monthlyCreditHour)}h`,
      detail:
        monthlyCreditHour > 0
          ? 'Giờ uy tín được ghi nhận trong tháng hiện tại'
          : 'Chưa có dữ liệu giờ uy tín tháng này',
      icon: Clock3,
      cardClass: 'from-cyan-50 to-white',
      iconClass: 'text-cyan-700'
    },
    {
      label: 'Tỉ lệ vắng mặt trong tháng',
      value:
        monthlyApplications > 0
          ? `${(((monthlyApplications - monthlyAttendedApplications) / monthlyApplications) * 100).toFixed(1)}%`
          : '--',
      detail:
        monthlyApplications > 0
          ? `Tính từ ${formatNumber(monthlyApplications)} đơn đăng ký`
          : 'Chưa có dữ liệu hàng tháng',
      icon: TrendingUp,
      cardClass: 'from-rose-50 to-white',
      iconClass: 'text-rose-700'
    }
  ];

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
        <Card className="overflow-hidden border-zinc-200 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                Bảng điều khiển organizer
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                {greeting}, Quản trị viên {displayName}!
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Theo dõi nhanh tình trạng host, tiến độ sự kiện và các chỉ số
                vận hành quan trọng của tổ chức trong một màn hình.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                  Host
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {formatNumber(totalHosts)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                  Tổng số sự kiện đã hoàn thành
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {formatNumber(totalEvents)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                  Rating
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {avgRating > 0 ? avgRating.toFixed(1) : '--'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                  Tổng số giờ uy tín
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {formatNumber(
                    firstNumber(props.userDetails, [
                      'totalCreditHour',
                      'creditHour',
                      'monthlyCreditHour',
                      'creditHourThisMonth',
                      'monthlyHours'
                    ])
                  )}
                  h
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="border-zinc-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`rounded-2xl bg-gradient-to-br ${metric.cardClass} p-4`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-600">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-xs font-medium text-zinc-600">
                        {metric.detail}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-sm">
                      <Icon className={`h-5 w-5 ${metric.iconClass}`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-zinc-700" />
                  <h3 className="text-lg font-bold text-zinc-950">
                    Phân tích tăng trưởng theo tháng
                  </h3>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Theo dõi tỷ lệ vắng mặt, số sự kiện đã hoàn thành và số giờ
                  tích lũy qua từng tháng.
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ApexChart
                type="line"
                options={{
                  ...monthlyGrowthOptions,
                  xaxis: {
                    ...monthlyGrowthOptions.xaxis,
                    categories: monthLabels
                  }
                }}
                series={monthlyGrowthSeries}
                height="100%"
                width="100%"
              />
            </div>
          </Card>

          <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-5">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-zinc-700" />
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  Top host của tháng này
                </h3>
                <p className="text-sm text-zinc-500">
                  Xếp hạng theo số sự kiện và giờ uy tín trong tháng hiện tại.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {sortedTopHosts.slice(0, 5).map((host, index) => (
                <div
                  key={`${host.name}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {host.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatNumber(safeNumber(host.hours))} giờ uy tín
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-zinc-300 text-zinc-700"
                  >
                    {formatNumber(safeNumber(host.events))} sự kiện
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
