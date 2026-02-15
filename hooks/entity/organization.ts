// Organization Entities

import { EOrgType, BaseEntity } from './common';
import { SystemAdmin } from './systemAdmin';

export interface Organization extends BaseEntity {
  id: string;
  name: string;
  dhaRegistered: boolean;
  orgType: EOrgType;
  orgIntroduction: string;
  otherEvidences: string | null;
  createdAt: string;
  updatedAt: string;
  createBy?: SystemAdmin;
}

export interface OrganizationManager extends BaseEntity {
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
  createdBy?: SystemAdmin;
  organization?: Organization;
}

export interface Host extends BaseEntity {
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
  createdBy?: OrganizationManager;
  organization: Organization;
}
