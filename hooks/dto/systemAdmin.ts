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

export interface SystemAdminAccountInformationResponse {
  id: string;
  cid: string;
  email: string;
  phone: string;
  fullName: string;
  gender: boolean;
  dob: string;
  avatarUrl: string;
  address: string;
  detailAddress: string;
}

export interface UpdateSystemAdminProfileRequest {
  fullName?: string;
  gender?: boolean;
  dob?: string;
  avatarExtension?: string;
  address?: string;
  detailAddress?: string;
}

export interface UpdateSystemAdminProfileResponse {
  id: string;
  cid: string;
  email: string;
  phone: string;
  fullName: string;
  gender: boolean;
  dob: string;
  avatarUrl: string;
  address: string;
  detailAddress: string;
  avatarUploadUrl?: string;
}
