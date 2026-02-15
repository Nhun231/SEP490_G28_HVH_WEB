// Volunteer Entity

import { EEmployStatus, EEducationLevel, BaseEntity } from './common';
import { SystemAdmin } from './systemAdmin';

export interface Volunteer extends BaseEntity {
  id: string;
  vid: string; // volunteer id
  cid: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  nickname: string | null;
  fullName: string | null;
  bio: string | null;
  gender: boolean;
  dob: string | null;
  level: number;
  avatarUrl: string | null;
  address: string | null;
  detailAddress: string | null;
  employStatus: EEmployStatus | null;
  workAddress: string | null;
  educationLevel: EEducationLevel | null;
  sid: string | null; // student id
  createdAt: string;
  updatedAt: string;
  createdBy?: SystemAdmin;
}
