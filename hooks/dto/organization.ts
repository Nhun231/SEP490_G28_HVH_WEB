import { EOrgType } from '@/constants/org-type';
import type { SystemAdmin } from '@/hooks/entity';
export interface RegisterOrganizationRequest {
  otp: string;
  name: string;
  dhaRegistered: boolean;
  orgType: EOrgType;
  orgIntroduction: string;
  managerFullName: string;
  managerCid: string;
  managerPhone: string;
  managerEmail: string;
  managerCidFrontExtension: string;
  managerCidBackExtension: string;
  managerCidHoldingExtension: string;
  legalDocumentsExtensions: string;
  otherEvidencesExtensions: string;
  applicationReason: string;
}

export { EOrgType };

export enum EOrgRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum EOrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
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

export interface OrganizationDetailsResponseForSystemAdmin {
  id: string;
  name: string;
  dhaRegistered: boolean;
  orgType: EOrgType;
  orgIntroduction: string;
  avatarImageUrl: string | null;
  coverImageUrl: string | null;
  legalDocumentUrls: string[];
  otherEvidencesUrls: string[];
  createdAt: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  managerCID: string;
  totalHosts: number;
  hostedEventCount: number;
  creditHour: number;
  avgRating: number;
  status: EOrganizationStatus;
  activitySubDomains: string[];
  note: string;
}

export interface OrganizationSimpleResponse {
  id: string;
  name: string;
  orgType: EOrgType | null;
  hostedEventCount: number;
  creditHour: number;
  avgRating: number;
  status: EOrganizationStatus;
  activitySubDomains: string[];
}

export interface OrganizationListResponseForAdmin {
  content: OrganizationSimpleResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface OrganizationRegistrationDetailsResponse {
  legalDocumentsUrls: null;
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

export interface OrgManagerAccountInformationResponse {
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

export interface UpdateOrgManagerProfileRequest {
  fullName?: string;
  gender?: boolean;
  dob?: string;
  avatarExtension?: string;
  address?: string;
  detailAddress?: string;
}

export interface UpdateOrgManagerProfileResponse {
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

export interface TopHostPayload {
  hostId: string;
  fullName: string;
  email: string;
  totalEvent: number;
  totalCreditHour: number;
}

export interface OrganizationStatsResponseForManager {
  year: number;
  month: number;
  completedEvents: number;
  creditHours: number;
  approvedApplications: number;
  attendedApplications: number;
  topHostPayloads: TopHostPayload[];
}

export interface OrganizationCountHostsAndEventsResponse {
  hostsCount: number;
  recruitingEventsCount: number;
  upcomingEventsCount: number;
  ongoingEventsCount: number;
}
