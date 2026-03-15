export enum EAccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AccountStatusOption {
  value: EAccountStatus;
  label: string;
}

export const ACCOUNT_STATUS_OPTIONS: AccountStatusOption[] = [
  { value: EAccountStatus.PENDING, label: 'Chờ duyệt' },
  { value: EAccountStatus.APPROVED, label: 'Đã duyệt' },
  { value: EAccountStatus.REJECTED, label: 'Đã từ chối' }
];

export const ACCOUNT_STATUS_LABELS: Record<EAccountStatus, string> =
  ACCOUNT_STATUS_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EAccountStatus, string>
  );
