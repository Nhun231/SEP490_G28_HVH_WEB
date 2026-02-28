import type { SystemAdmin } from '@/hooks/entity';
export interface RegisterOrganizationRequest {
  otp: string;
  name: string;
  dhaRegistered: boolean;
  orgType: string;
  orgIntroduction: string;
  managerFullName: string;
  managerCid: string;
  managerPhone: string;
  managerEmail: string;
  managerCidFrontExtension: string;
  managerCidBackExtension: string;
  managerCidHoldingExtension: string;
  otherEvidencesExtensions: string;
  applicationReason: string;
}

export enum EOrgType {
  NGO = 'NGO',
  COOPERATIVE = 'COOPERATIVE',
  SOCIAL_ENTERPRISE = 'SOCIAL_ENTERPRISE',
  COMMUNITY_BASED_ORG = 'COMMUNITY_BASED_ORG',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  EDUCATIONAL_INSTITUTION = 'EDUCATIONAL_INSTITUTION',
  OTHER = 'OTHER'
}

export enum EOrgRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface OrganizationInfo {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: EOrgType | null;
  orgIntroduction: string | null;
  otherEvidences: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrganizationManagerInfo {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrganizationRegistrationDetailsResponse {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: EOrgType | null;
  orgIntroduction: string | null;
  managerFullName: string | null;
  managerCid: string | null;
  managerPhone: string | null;
  managerEmail: string | null;
  managerCidFrontUrl: string | null;
  managerCidBackUrl: string | null;
  managerCidHoldingUrl: string | null;
  otherEvidencesUrls: string[] | null;
  applicationReason: string | null;
  status: EOrgRegistrationStatus | null;
  rejectionReason: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  reviewedBy: SystemAdmin | null;
  organization: OrganizationInfo | null;
  orgManager: OrganizationManagerInfo | null;
  note: string | null;
}

export interface OrganizationRegistrationSimpleResponse {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: EOrgType | null;
  managerFullName: string | null;
  managerCid: string | null;
  managerEmail: string | null;
}

export interface OrganizationRegistrationVerifyRequest {
  approve: boolean;
  rejectionReason: string | null;
}
