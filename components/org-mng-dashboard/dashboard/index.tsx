'use client';

import { User } from '@supabase/supabase-js';
import { MdPeople, MdEvent, MdVolunteerActivism, MdPending } from 'react-icons/md';
import StatsCard from './StatsCard';
import HostList from './HostList';
import EventList from './EventList';
import EventChart from './EventChart';

interface OrgMngDashboardProps {
  user: User;
  profile: any;
}

export default function OrgMngDashboard({ user, profile }: OrgMngDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard quản lý tổ chức
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Chào mừng trở lại, {profile?.full_name || 'Quản lý viên'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng số host"
          value="47"
          icon={<MdPeople />}
          color="blue"
          trend={{ value: '+8.2%', isPositive: true }}
        />
        <StatsCard
          title="Tổng số sự kiện"
          value="124"
          icon={<MdEvent />}
          color="green"
          trend={{ value: '+15.3%', isPositive: true }}
        />
        <StatsCard
          title="Sự kiện Tình nguyện viên"
          value="16"
          icon={<MdVolunteerActivism />}
          color="orange"
          trend={{ value: '+5.7%', isPositive: true }}
        />
        <StatsCard
          title="Sự kiện chờ duyệt"
          value="7"
          icon={<MdPending />}
          color="purple"
          trend={{ value: '+12.4%', isPositive: true }}
        />
      </div>

      {/* Middle Section: Host List & Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HostList />
        <EventList />
      </div>

      {/* Chart Section */}
      <EventChart />
    </div>
  );
}
