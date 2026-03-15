export enum ENotificationDataAction {
  HOST_EVENT_DETAILS = 'HOST_EVENT_DETAILS',
  MNG_EVENT_DETAILS = 'MNG_EVENT_DETAILS',
  ADM_EVENT_DETAILS = 'ADM_EVENT_DETAILS'
}

export interface NotificationDataActionOption {
  value: ENotificationDataAction;
  label: string;
}

export const NOTIFICATION_DATA_ACTION_OPTIONS: NotificationDataActionOption[] =
  [
    {
      value: ENotificationDataAction.HOST_EVENT_DETAILS,
      label: 'Chi tiết sự kiện (Host)'
    },
    {
      value: ENotificationDataAction.MNG_EVENT_DETAILS,
      label: 'Chi tiết sự kiện (Quản lý)'
    },
    {
      value: ENotificationDataAction.ADM_EVENT_DETAILS,
      label: 'Chi tiết sự kiện (Admin)'
    }
  ];

export const NOTIFICATION_DATA_ACTION_LABELS: Record<
  ENotificationDataAction,
  string
> = NOTIFICATION_DATA_ACTION_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  {} as Record<ENotificationDataAction, string>
);
