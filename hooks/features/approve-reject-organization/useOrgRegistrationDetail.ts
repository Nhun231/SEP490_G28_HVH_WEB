import { useMemo } from 'react';
import useSWR from 'swr';

export interface OrgRegistrationDetailResponse {
  id: string;
  name: string | null;
  dhaRegistered: boolean | null;
  orgType: string | null;
  orgIntroduction: string | null;
  managerFullName: string | null;
  managerCid: string | null;
  managerPhone: string | null;
  managerEmail: string | null;
  managerCidFrontUrl: string | null;
  managerCidBackUrl: string | null;
  managerCidHoldingUrl: string | null;
  otherEvidencesUrls: string[] | null;
  applicationReason: string | null;
  status: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  reviewedBy: {
    id: string;
    cid: string | null;
    email: string | null;
    phone: string | null;
    fullName: string | null;
  } | null;
  organization: {
    id: string;
    name: string | null;
    dhaRegistered: boolean | null;
    orgType: string | null;
    orgIntroduction: string | null;
    otherEvidences: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  orgManager: {
    id: string;
    cid: string | null;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  note: string | null;
}

interface Params {
  id?: string | null;
  baseUrl?: string;
}

export const useOrgRegistrationDetail = ({ id, baseUrl = '' }: Params) => {
  const detailUrl = useMemo(() => {
    if (!id) return null;
    const path = `/organization/registrations/${id}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }, [baseUrl, id]);

  return useSWR<OrgRegistrationDetailResponse>(detailUrl);
};
