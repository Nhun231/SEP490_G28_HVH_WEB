export enum EEventStatus {
  EDITING = 'EDITING',
  SUBMITTED = 'SUBMITTED',
  APPROVED_BY_MNG = 'APPROVED_BY_MNG',
  REJECTED_BY_MNG = 'REJECTED_BY_MNG',
  REJECTED_BY_AD = 'REJECTED_BY_AD',
  RECRUITING = 'RECRUITING',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface EventStatusOption {
  value: EEventStatus;
  label: string;
}

export const EVENT_STATUS_OPTIONS: EventStatusOption[] = [
  { value: EEventStatus.EDITING, label: 'Bản nháp' },
  { value: EEventStatus.SUBMITTED, label: 'Chờ quản lý duyệt' },
  { value: EEventStatus.APPROVED_BY_MNG, label: 'Chờ quản trị viên duyệt' },
  { value: EEventStatus.REJECTED_BY_MNG, label: 'Quản lý từ chối' },
  { value: EEventStatus.REJECTED_BY_AD, label: 'Quản trị viên từ chối' },
  { value: EEventStatus.RECRUITING, label: 'Đang tuyển quân' },
  { value: EEventStatus.UPCOMING, label: 'Sắp diễn ra' },
  { value: EEventStatus.ONGOING, label: 'Đang diễn ra' },
  { value: EEventStatus.ENDED, label: 'Đã kết thúc' },
  { value: EEventStatus.COMPLETED, label: 'Hoàn thành' },
  { value: EEventStatus.CANCELLED, label: 'Đã hủy' }
];

export const EVENT_STATUS_LABELS: Record<EEventStatus, string> =
  EVENT_STATUS_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EEventStatus, string>
  );
