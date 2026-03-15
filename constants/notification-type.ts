export enum ENotificationType {
  MNG_EVENT_CREATED = 'MNG_EVENT_CREATED',
  HOST_EVENT_APPROVED_BY_MNG = 'HOST_EVENT_APPROVED_BY_MNG',
  ADM_EVENT_APPROVED_BY_MNG = 'ADM_EVENT_APPROVED_BY_MNG',
  HOST_EVENT_REJECTED_BY_MNG = 'HOST_EVENT_REJECTED_BY_MNG',
  HOST_EVENT_APPROVED_BY_AD = 'HOST_EVENT_APPROVED_BY_AD',
  MNG_EVENT_APPROVED_BY_AD = 'MNG_EVENT_APPROVED_BY_AD',
  HOST_EVENT_REJECTED_BY_AD = 'HOST_EVENT_REJECTED_BY_AD',
  MNG_EVENT_REJECTED_BY_AD = 'MNG_EVENT_REJECTED_BY_AD'
}

export interface NotificationTypeOption {
  value: ENotificationType;
  label: string;
}

export const NOTIFICATION_TYPE_OPTIONS: NotificationTypeOption[] = [
  {
    value: ENotificationType.MNG_EVENT_CREATED,
    label: 'Sự kiện mới (Quản lý)'
  },
  {
    value: ENotificationType.HOST_EVENT_APPROVED_BY_MNG,
    label: 'Host: Được quản lý duyệt'
  },
  {
    value: ENotificationType.ADM_EVENT_APPROVED_BY_MNG,
    label: 'Admin: Được quản lý duyệt'
  },
  {
    value: ENotificationType.HOST_EVENT_REJECTED_BY_MNG,
    label: 'Host: Bị quản lý từ chối'
  },
  {
    value: ENotificationType.HOST_EVENT_APPROVED_BY_AD,
    label: 'Host: Được admin duyệt'
  },
  {
    value: ENotificationType.MNG_EVENT_APPROVED_BY_AD,
    label: 'Quản lý: Được admin duyệt'
  },
  {
    value: ENotificationType.HOST_EVENT_REJECTED_BY_AD,
    label: 'Host: Bị admin từ chối'
  },
  {
    value: ENotificationType.MNG_EVENT_REJECTED_BY_AD,
    label: 'Quản lý: Bị admin từ chối'
  }
];

export const NOTIFICATION_TYPE_LABELS: Record<ENotificationType, string> =
  NOTIFICATION_TYPE_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<ENotificationType, string>
  );
