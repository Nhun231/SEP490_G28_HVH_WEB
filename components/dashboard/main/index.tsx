/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useGetStatistic } from '@/hooks/features/uc064-view-dashboard-by-admin/useGetStatistic';
import type { IRoute } from '@/types/types';
import { User } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Clock3,
  FileCheck2,
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
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
}

const domainSeries = [34, 23, 19, 14, 10];

const domainOptions: any = {
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },
  labels: ['Môi trường', 'Giáo dục', 'Y tế', 'Cộng đồng', 'Khác'],
  colors: ['#2563eb', '#0d9488', '#f59e0b', '#e11d48', '#6b7280'],
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%'
      }
    }
  },
  stroke: {
    width: 0
  }
};

const integrityAlerts = [
  {
    title: 'Tỷ lệ vắng mặt bất thường',
    description: '3 tổ chức có tỷ lệ check-in < 45% trong 14 ngày gần nhất.',
    severity: 'Cao',
    events: [
      {
        name: 'Hiến máu nhân đạo - Đợt 2',
        organization: 'CLB Tình Nguyện Thanh Xuân'
      },
      {
        name: 'Dọn rác Hồ Tây cuối tuần',
        organization: 'Nhóm Thiện Nguyện Cầu Giấy'
      },
      {
        name: 'Lớp học kỹ năng cho trẻ em',
        organization: 'Quỹ Hỗ trợ Xanh Hà Nội'
      }
    ]
  },
  {
    title: 'Tài khoản bị khóa mới',
    description: '8 tài khoản TNV bị khóa do vi phạm chính sách hành vi.',
    severity: 'Thấp',
    accounts: ['Lê Minh Đức', 'Phạm Thu Thảo', 'Hoàng Nam']
  }
];

const quickHealthMetrics: Array<{ label: string; value: string }> = [];

const monthKey = (year: number, month: number) => year * 100 + month;

export default function Main(props: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const { data: statsData = [], isLoading: isStatsLoading } = useGetStatistic({
    baseUrl: apiBaseUrl
  });

  const sortedDesc = [...statsData].sort(
    (a, b) => monthKey(b.year, b.month) - monthKey(a.year, a.month)
  );
  const sortedAsc = [...sortedDesc].reverse();

  const currentStats = sortedDesc[0];
  const previousStats = sortedDesc[1];

  const formatStat = (value?: number) =>
    typeof value === 'number' ? value.toLocaleString('vi-VN') : '--';

  const formatMonthLabel = (month?: number, year?: number) =>
    month && year ? `Tháng ${month}/${year}` : 'Thống kê hệ thống';

  const monthLabel = formatMonthLabel(currentStats?.month, currentStats?.year);
  const previousMonthLabel = formatMonthLabel(
    previousStats?.month,
    previousStats?.year
  );

  const buildTrendText = (current?: number, previous?: number) => {
    if (typeof current !== 'number') return 'Chưa có dữ liệu';
    if (typeof previous !== 'number') return monthLabel;

    if (previous === 0) {
      if (current === 0) {
        return `So với ${previousMonthLabel}: 0%`;
      }

      return `So với ${previousMonthLabel}: không so sánh được`;
    }

    const percent = ((current - previous) / previous) * 100;
    const sign = percent > 0 ? '+' : '';
    return `So với ${previousMonthLabel}: ${sign}${percent.toFixed(1)}%`;
  };

  const getTrendClassName = (current?: number, previous?: number) => {
    if (typeof current !== 'number' || typeof previous !== 'number') {
      return 'text-zinc-500';
    }

    if (previous === 0) {
      return current === 0 ? 'text-zinc-500' : 'text-amber-600';
    }

    if (current > previous) return 'text-emerald-600';
    if (current < previous) return 'text-rose-600';
    return 'text-zinc-500';
  };

  const kpis = [
    {
      label: 'Tình nguyện viên đã xác thực',
      value: formatStat(currentStats?.verifiedVolunteers),
      trend: buildTrendText(
        currentStats?.verifiedVolunteers,
        previousStats?.verifiedVolunteers
      ),
      trendClassName: getTrendClassName(
        currentStats?.verifiedVolunteers,
        previousStats?.verifiedVolunteers
      ),
      icon: Users
    },
    {
      label: 'Tổ chức đã xác thực',
      value: formatStat(currentStats?.verifiedOrganizations),
      trend: buildTrendText(
        currentStats?.verifiedOrganizations,
        previousStats?.verifiedOrganizations
      ),
      trendClassName: getTrendClassName(
        currentStats?.verifiedOrganizations,
        previousStats?.verifiedOrganizations
      ),
      icon: Building2
    },
    {
      label: 'Sự kiện đã hoàn thành',
      value: formatStat(currentStats?.completedEvents),
      trend: buildTrendText(
        currentStats?.completedEvents,
        previousStats?.completedEvents
      ),
      trendClassName: getTrendClassName(
        currentStats?.completedEvents,
        previousStats?.completedEvents
      ),
      icon: CalendarCheck
    },
    {
      label: 'Giờ uy tín tích lũy',
      value: formatStat(currentStats?.creditHours),
      trend: buildTrendText(
        currentStats?.creditHours,
        previousStats?.creditHours
      ),
      trendClassName: getTrendClassName(
        currentStats?.creditHours,
        previousStats?.creditHours
      ),
      icon: Clock3
    },
    {
      label: 'Đơn đăng ký đã duyệt',
      value: formatStat(currentStats?.approvedApplications),
      trend: buildTrendText(
        currentStats?.approvedApplications,
        previousStats?.approvedApplications
      ),
      trendClassName: getTrendClassName(
        currentStats?.approvedApplications,
        previousStats?.approvedApplications
      ),
      icon: FileCheck2
    },
    {
      label: 'Đơn tham gia đã điểm danh',
      value: formatStat(currentStats?.attendedApplications),
      trend: buildTrendText(
        currentStats?.attendedApplications,
        previousStats?.attendedApplications
      ),
      trendClassName: getTrendClassName(
        currentStats?.attendedApplications,
        previousStats?.attendedApplications
      ),
      icon: BadgeCheck
    }
  ];

  const growthSeries = [
    {
      name: 'TNV đã xác thực',
      data: sortedAsc.map((item) => item.verifiedVolunteers)
    },
    {
      name: 'Giờ uy tín',
      data: sortedAsc.map((item) => item.creditHours)
    }
  ];

  const growthOptions: any = {
    chart: {
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    colors: ['#0f766e', '#1d4ed8'],
    stroke: {
      width: [3, 3],
      curve: 'smooth'
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#e4e4e7',
      strokeDashArray: 4
    },
    xaxis: {
      categories: sortedAsc.map(
        (item) => `T${item.month}/${String(item.year).slice(-2)}`
      ),
      labels: { style: { colors: '#52525b', fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: '#52525b', fontWeight: 600 } }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    tooltip: {
      theme: 'dark'
    }
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title={props.title ?? 'Bảng điều khiển'}
      description={props.description ?? 'Tổng quan chiến lược toàn hệ thống'}
      routes={props.routes}
      colorVariant={props.colorVariant}
      signInPath={props.signInPath}
    >
      <div className="mx-auto w-full max-w-7xl pb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Badge className="bg-zinc-900 text-white hover:bg-zinc-900">
            {isStatsLoading ? 'Đang tải thống kê...' : monthLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => {
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
                    <p
                      className={`mt-2 text-xs font-medium ${kpi.trendClassName}`}
                    >
                      {kpi.trend}
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

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
          {quickHealthMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                {metric.label}
              </p>
              <p className="mt-2 text-xl font-bold text-zinc-950">
                {metric.value}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  Tăng trưởng nhiều tháng
                </h3>
                <p className="text-sm text-zinc-500">
                  Biến động tình nguyện viên đã xác thực và credit hour theo
                  tháng
                </p>
              </div>
              <Badge className="bg-zinc-900 text-white hover:bg-zinc-900">
                {sortedAsc.length} tháng dữ liệu
              </Badge>
            </div>
            <div className="h-[320px] w-full">
              <ApexChart
                type="line"
                options={growthOptions}
                series={growthSeries}
                height="100%"
                width="100%"
              />
            </div>
          </Card>

          <Card className="border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-950">
              Phân bổ lĩnh vực
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Tỷ trọng hoạt động theo domain tình nguyện
            </p>
            <div className="mx-auto mt-2 h-[230px] max-w-[300px]">
              <ApexChart
                type="donut"
                options={domainOptions}
                series={domainSeries}
                height="100%"
                width="100%"
              />
            </div>
            <div className="mt-1 space-y-2">
              {domainOptions.labels.map((label: string, idx: number) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: domainOptions.colors[idx] }}
                    />
                    <p className="text-sm font-medium text-zinc-800">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {domainSeries[idx]}%
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
