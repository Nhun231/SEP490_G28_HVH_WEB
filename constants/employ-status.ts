export enum EEmployStatus {
  STUDENT = 'STUDENT',
  EMPLOYED = 'EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  RETIRED = 'RETIRED',
  OTHER = 'OTHER'
}

export interface EmployStatusOption {
  value: EEmployStatus;
  label: string;
}

export const EMPLOY_STATUS_OPTIONS: EmployStatusOption[] = [
  { value: EEmployStatus.STUDENT, label: 'Học sinh / Sinh viên' },
  { value: EEmployStatus.EMPLOYED, label: 'Đang đi làm' },
  { value: EEmployStatus.UNEMPLOYED, label: 'Thất nghiệp' },
  { value: EEmployStatus.RETIRED, label: 'Đã nghỉ hưu' },
  { value: EEmployStatus.OTHER, label: 'Khác' }
];

export const EMPLOY_STATUS_LABELS: Record<EEmployStatus, string> =
  EMPLOY_STATUS_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EEmployStatus, string>
  );
