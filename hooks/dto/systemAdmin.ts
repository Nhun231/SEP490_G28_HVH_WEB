export interface SystemStatsItem {
  year: number;
  month: number;
  verifiedVolunteers: number;
  verifiedOrganizations: number;
  completedEvents: number;
  creditHours: number;
  approvedApplications: number;
  attendedApplications: number;
}

export type SystemStatsResponse = SystemStatsItem[];
