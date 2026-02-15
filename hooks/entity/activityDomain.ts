// Activity Domain Entities

export interface ActivitySubDomain {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDomain {
  id: number;
  name: string;
  active: boolean;
  specialSessionMaxTime: number | null;
  activitySubDomains: ActivitySubDomain[];
  createdAt: string;
  updatedAt: string;
}
