export interface CreateHostAccountRequest {
  cid: string;
  email: string;
  phone: string;
  fullName: string;
  dob: string;
  address: string;
  detailAddress: string;
}

export const CID_REGEX = /^\d{12}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
export const FULLNAME_REGEX = /^[A-ZÀ-Ỹ][a-zà-ỹ]*(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]*)*$/;
