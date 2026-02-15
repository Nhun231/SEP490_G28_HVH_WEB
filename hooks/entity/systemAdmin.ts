// System Admin Entity

import { BaseUser } from './common';

export interface SystemAdmin extends BaseUser {
  // inherits: id, cid, email, phone, fullName, gender, dob, avatarUrl, address, detailAddress, createdAt, updatedAt
}
