// Activity Domain DTOs

export interface ActivitySubDomainDetailsResponse {
  id: number;
  name: string;
  active: boolean;
}

export interface ActivityDomainDetailsResponse {
  id?: number;
  name: string;
  specialSessionMaxTime: number | null;
  active: boolean;
  activitySubDomainList: ActivitySubDomainDetailsResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActivityDomainRequest {
  name: string;
  specialSessionMaxTime: number;
  activitySubDomain?: string[];
}

export type ActivitySubDomainAction = 'ADD' | 'EDIT' | 'DELETE';

export interface UpdateActivitySubDomainRequest {
  id?: number;
  name?: string;
  action: ActivitySubDomainAction;
}

export interface UpdateActivityDomainRequest {
  name: string;
  specialSessionMaxTime: number;
  activitySubDomainUpdateRequests: UpdateActivitySubDomainRequest[];
}

export interface ActivityDomainListResponse {
  content: ActivityDomainDetailsResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
