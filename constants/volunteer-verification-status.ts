export enum EVolunteerVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface VolunteerVerificationStatusOption {
  value: EVolunteerVerificationStatus;
  label: string;
}

export const VOLUNTEER_VERIFICATION_STATUS_OPTIONS: VolunteerVerificationStatusOption[] =
  [
    { value: EVolunteerVerificationStatus.PENDING, label: 'Chờ duyệt' },
    { value: EVolunteerVerificationStatus.APPROVED, label: 'Đã duyệt' },
    { value: EVolunteerVerificationStatus.REJECTED, label: 'Đã từ chối' }
  ];

export const VOLUNTEER_VERIFICATION_STATUS_LABELS: Record<
  EVolunteerVerificationStatus,
  string
> = VOLUNTEER_VERIFICATION_STATUS_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  {} as Record<EVolunteerVerificationStatus, string>
);
