// Identity Verification Entity

import { EVolunteerVerificationStatus, BaseEntity } from './common';
import { SystemAdmin } from './systemAdmin';
import { Volunteer } from './volunteer';

export interface IdentityVerification extends BaseEntity {
  id: string;
  cid: string;
  email: string;
  phone: string;
  cidFront: string;
  cidBack: string;
  cidHolding: string;
  status: EVolunteerVerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string;
  reviewedBy?: SystemAdmin;
  volunteer?: Volunteer;
}
