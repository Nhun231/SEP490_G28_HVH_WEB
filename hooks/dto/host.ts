import { EEventStatus } from '@/constants/event-status';

export interface CreateHostAccountRequest {
  cid: string;
  email: string;
  phone: string;
  fullName: string;
  dob: string;
  address: string;
  detailAddress: string;
}

export interface UpdateHostProfileRequest {
  fullName?: string;
  gender?: boolean;
  dob?: string;
  avatarExtension?: string;
  address?: string;
  detailAddress?: string;
}

export interface HostActivitiesResponse {
  eventId: string;
  eventName: string | null;
  eventAddress: string | null;
  eventDetailAddress: string | null;
  eventStatus: EEventStatus | null;
  sessionId: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
}

export interface HostActivitiesResponseForSystemAdmin {
  eventId: string;
  eventName: string | null;
  eventAddress: string | null;
  eventDetailAddress: string | null;
  eventStatus: EEventStatus | null;
  sessionId: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
}

export interface HostInfoResponseForManager {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  gender: boolean | null;
  dob: string | null;
  avatarUrl: string | null;
  address: string | null;
  detailAddress: string | null;
  createdAt: string | null;
}

export interface HostInfoResponseForSystemAdmin {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  gender: boolean | null;
  dob: string | null;
  avatarUrl: string | null;
  address: string | null;
  detailAddress: string | null;
  createdAt: string | null;
  avatarUploadUrl?: string | null;
}

export interface HostSimpleResponseForManager {
  id: string;
  fullName: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  hostedEventCount: number;
}

export interface HostSimpleResponseForSystemAdmin {
  id: string;
  fullName: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  hostedEventCount: number;
  avatarUrl: string | null;
}

export interface HostListResponse {
  content: HostSimpleResponseForManager[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface HostListResponseForSystemAdmin {
  content: HostSimpleResponseForSystemAdmin[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface HostActivitiesListResponse {
  content: HostActivitiesResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface HostActivitiesListResponseForSystemAdmin {
  content: HostActivitiesResponseForSystemAdmin[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export type HostListItem = HostSimpleResponseForManager;
export type HostListItemForSystemAdmin = HostSimpleResponseForSystemAdmin;

export const CID_REGEX = /^\d{12}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
export const FULLNAME_REGEX = /^[A-ZÀ-Ỹ][a-zà-ỹ]*(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]*)*$/;
