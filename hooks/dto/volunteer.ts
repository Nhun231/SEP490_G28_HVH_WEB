// Volunteer Registration DTOs

import type { SystemAdmin } from '@/hooks/entity';

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
