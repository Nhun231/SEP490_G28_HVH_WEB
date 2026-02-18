// Pending Account Entities

export interface PendingAccountItem {
  id: string;
  email: string | null;
  phone: string | null;
  cid: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface PendingAccountVerification {
  id: string;
  cid: string | null;
  email: string | null;
  phone: string | null;
  cid_front: string | null;
  cid_back: string | null;
  cid_holding: string | null;
  status: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  volunteer_id: string | null;
  note: string | null;
}
