'use client';

import { useCountHostAndEvents } from '@/hooks/features/org-manager/uc085-view-dashboard-by-org-manager/useCountHostAndEvents';
import { useGetStatistic } from '@/hooks/features/org-manager/uc085-view-dashboard-by-org-manager/useGetStatistic';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizerMainDashboard from '@/components/dashboard/organizer-main';

export default function OrganizerMain() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const { data: orgStats } = useGetStatistic({
    baseUrl: apiBaseUrl,
    enabled: Boolean(user)
  });

  const { data: orgCounts } = useCountHostAndEvents({
    baseUrl: apiBaseUrl,
    enabled: Boolean(user)
  });

  const mergedUserDetails = useMemo(() => {
    const statsList = Array.isArray(orgStats) ? orgStats : [];
    const currentStats = statsList[0];
    const counts = orgCounts;
    const accumulatedCreditHour = statsList.reduce(
      (total, item) => total + (Number(item?.creditHours) || 0),
      0
    );
    const totalCompletedEvents = statsList.reduce(
      (total, item) => total + (Number(item?.completedEvents) || 0),
      0
    );
    const topHostPayloads = Array.isArray(currentStats?.topHostPayloads)
      ? currentStats.topHostPayloads
      : [];

    return {
      ...(counts ?? {}),
      monthlyStats: statsList,
      ...(currentStats
        ? {
            endedEventsThisMonth: currentStats.completedEvents,
            monthlyCreditHour: currentStats.creditHours,
            totalCreditHour: accumulatedCreditHour,
            creditHour: accumulatedCreditHour,
            monthlyApplicationCount: currentStats.approvedApplications,
            monthlyAttendedApplicationCount: currentStats.attendedApplications,
            topHostsCurrentMonth: topHostPayloads.map((host) => ({
              name: host.fullName,
              events: host.totalEvent,
              hours: host.totalCreditHour
            })),
            topHosts: topHostPayloads.map((host) => ({
              name: host.fullName,
              events: host.totalEvent,
              hours: host.totalCreditHour
            }))
          }
        : {}),
      totalHosts: counts?.hostsCount ?? 0,
      hostCount: counts?.hostsCount ?? 0,
      hostsCount: counts?.hostsCount ?? 0,
      totalEvents: totalCompletedEvents || 0,
      hostedEventCount: totalCompletedEvents || 0,
      ongoingEventCount: counts?.ongoingEventsCount ?? 0,
      activeEventCount: counts?.ongoingEventsCount ?? 0,
      currentEventCount: counts?.ongoingEventsCount ?? 0
    };
  }, [orgCounts, orgStats]);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(user);
    };

    fetchUserData();
  }, [supabase, router]);

  return (
    <OrganizerMainDashboard
      user={user}
      userDetails={mergedUserDetails}
      title="Bảng điều khiển tổ chức"
      description="Theo dõi năng suất Host và luồng phê duyệt nội bộ"
      signInPath="/signin/password_signin"
    />
  );
}
