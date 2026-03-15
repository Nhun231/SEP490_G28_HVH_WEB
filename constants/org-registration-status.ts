export enum EOrgRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface OrgRegistrationStatusOption {
  value: EOrgRegistrationStatus;
  label: string;
}

export const ORG_REGISTRATION_STATUS_OPTIONS: OrgRegistrationStatusOption[] = [
  { value: EOrgRegistrationStatus.PENDING, label: 'Chờ duyệt' },
  { value: EOrgRegistrationStatus.APPROVED, label: 'Đã duyệt' },
  { value: EOrgRegistrationStatus.REJECTED, label: 'Đã từ chối' }
];

export const ORG_REGISTRATION_STATUS_LABELS: Record<
  EOrgRegistrationStatus,
  string
> = ORG_REGISTRATION_STATUS_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  {} as Record<EOrgRegistrationStatus, string>
);
