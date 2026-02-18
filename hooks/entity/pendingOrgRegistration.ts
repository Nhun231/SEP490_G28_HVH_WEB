// Pending Organization Registration Entities

export interface OrgRegistrationItem {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: string | null;
  managerFullName: string | null;
  managerCid: string | null;
  managerEmail: string | null;
}
