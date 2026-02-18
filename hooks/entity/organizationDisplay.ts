// Organization UI Display Entities

export interface OrganizationItem {
  id: string;
  name: string;
  taxCode: string;
  location: string;
  orgType: string;
  rating: number;
  reviews: number;
  volunteers: number;
  donations: number;
  imageUrl: string;
  tags: Array<{ label: string; variant: 'default' | 'secondary' | 'outline' }>;
  status: 'Hoạt động' | 'Ngừng hoạt động';
}

export interface BasicInfo {
  email: string;
  address: string;
  founded: string;
  taxCode: string;
  yearRegistered: string;
}

export interface AdminInfo {
  name: string;
  position: string;
  phone: string;
  email: string;
  cccd?: string;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  taxCode: string;
  location: string;
  orgType: string;
  status: 'Hoạt động' | 'Ngừng hoạt động';
  rating: number;
  reviews: number;
  volunteers: number;
  donations: number;
  imageUrl: string;
  introduction: string;
  applicationReason: string;
  basicInfo: BasicInfo;
  adminInfo: AdminInfo;
  registrationImages?: string[];
  supportingDocuments?: string[];
}
