export { EOrgType } from '@/constants/org-type';

// Common Entity Interfaces

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUser {
  id: string;
  cid: string;
  email: string;
  phone: string;
  fullName: string | null;
  gender: boolean | null;
  dob: string | null;
  avatarUrl: string | null;
  address: string | null;
  detailAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
}

export enum EOrgRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum EVolunteerVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum EEmployStatus {
  EMPLOYED = 'EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  STUDENT = 'STUDENT'
}

export enum EEducationLevel {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  PHD = 'PHD',
  OTHER = 'OTHER'
}
