// Volunteer Registration DTOs

import type { SystemAdmin } from '@/hooks/entity';
import { EAccountStatus } from '@/constants/account-status';
import { EEventStatus } from '@/constants/event-status';

export enum EVolunteerVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface VolunteerInfo {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VolunteerRegistrationDetailsResponse {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  cidFrontUrl: string | null;
  cidBackUrl: string | null;
  cidHoldingUrl: string | null;
  status: EVolunteerVerificationStatus | null;
  rejectionReason: string | null;
  createdAt: string | null;
  reviewAt: string | null;
  reviewBy: SystemAdmin | null;
  volunteer: VolunteerInfo | null;
  note: string | null;
}

export interface VolunteerRegistrationSimpleResponse {
  id: string;
  email: string | null;
  cid: string | null;
  status: EVolunteerVerificationStatus | null;
  createdAt: string | null;
}

export interface VolunteerRegistrationVerifyRequest {
  approve: boolean;
  rejectionReason: string | null;
  fullName: string;
}

export interface VolunteerSimpleResponseForAdmin {
  id: string;
  vid: string;
  avatarUrl: string | null;
  fullName: string | null;
  cid: string | null;
  phone: string | null;
  email: string | null;
  dob: string | null;
  activityCount: number | null;
  avgRating: number | null;
  creditScore: number | null;
  status: EAccountStatus | null;
  address: string | null;
  detailAddress: string | null;
}

export interface VolunteerListResponseForAdmin {
  content: VolunteerSimpleResponseForAdmin[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export type VolunteerListItemForAdmin = VolunteerSimpleResponseForAdmin;

export interface VolunteerActivitiesResponseForAdmin {
  eventId: string;
  eventName: string | null;
  eventAddress: string | null;
  eventDetailAddress: string | null;
  eventStatus: EEventStatus | null;
  sessionId: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  sessionRating: number | null;
  applicationStatus: string | null;
  sessionCreditHour: number | null;
}

export interface VolunteerActivitiesListResponseForAdmin {
  content: VolunteerActivitiesResponseForAdmin[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface UpdateVolunteerProfileBySystemAdminRequest {
  email: string;
  phone: string;
  cid: string;
  nickName: string;
  fullName: string;
  bio: string;
  gender: boolean;
  dob: string;
  avatarExtension?: string | null;
  address: string;
  detailAddress: string;
  employStatus: string;
  workAddress: string;
  educationLevel: string;
  sid: string;
  deviceId: string;
}

export interface UpdateVolunteerProfileBySystemAdminResponse {
  id: string;
  vid: string | null;
  avatarUrl: string | null;
  fullName: string | null;
  cid: string | null;
  phone: string | null;
  email: string | null;
  dob: string | null;
  address: string | null;
  detailAddress: string | null;
  avatarUploadUrl?: string;
}
