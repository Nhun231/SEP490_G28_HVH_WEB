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
  const [userDetails, setUserDetails] = useState(null);
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
      ...(userDetails ?? {}),
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
      totalHosts: counts?.hostsCount ?? (userDetails as any)?.totalHosts ?? 0,
      hostCount: counts?.hostsCount ?? (userDetails as any)?.hostCount ?? 0,
      hostsCount: counts?.hostsCount ?? (userDetails as any)?.hostsCount ?? 0,
      totalEvents:
        totalCompletedEvents || (userDetails as any)?.totalEvents || 0,
      hostedEventCount:
        totalCompletedEvents || (userDetails as any)?.hostedEventCount || 0,
      ongoingEventCount:
        counts?.ongoingEventsCount ??
        (userDetails as any)?.ongoingEventCount ??
        0,
      activeEventCount:
        counts?.ongoingEventsCount ??
        (userDetails as any)?.activeEventCount ??
        0,
      currentEventCount:
        counts?.ongoingEventsCount ??
        (userDetails as any)?.currentEventCount ??
        0
    };
  }, [orgCounts, orgStats, userDetails]);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const { data: userDetails } = await supabase
        .from('user_details')
        .select('*')
        .single();

      if (!user) {
        router.push('/signin/password_signin');
        return;
      }

      setUser(user);
      setUserDetails(userDetails);
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
