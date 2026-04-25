import { EEmployStatus, EEducationLevel } from '@/hooks/dto';

export type GraduationStatus = EEducationLevel;

export const EMPLOY_STATUS_VI_LABELS: Record<EEmployStatus, string> = {
  [EEmployStatus.STUDENT]: 'Học sinh / Sinh viên',
  [EEmployStatus.EMPLOYED]: 'Đang đi làm',
  [EEmployStatus.UNEMPLOYED]: 'Thất nghiệp',
  [EEmployStatus.RETIRED]: 'Đã nghỉ hưu',
  [EEmployStatus.OTHER]: 'Khác'
};

export const GRADUATION_STATUS_VI_LABELS: Record<GraduationStatus, string> = {
  [EEducationLevel.SECONDARY]: 'Trung học cơ sở',
  [EEducationLevel.HIGH_SCHOOL]: 'Trung học phổ thông',
  [EEducationLevel.COLLEGE]: 'Cao đẳng',
  [EEducationLevel.UNDERGRADUATE]: 'Đại học',
  [EEducationLevel.POSTGRADUATE]: 'Sau đại học',
  [EEducationLevel.PROFESSIONAL]: 'Chuyên môn',
  [EEducationLevel.OTHER]: 'Khác'
};

export const getEmployStatusViLabel = (
  value: EEmployStatus | string | null | undefined
) => {
  if (!value) return 'Chưa cập nhật';
  return EMPLOY_STATUS_VI_LABELS[value as EEmployStatus] ?? value;
};

export const getGraduationStatusViLabel = (
  value: GraduationStatus | string | null | undefined
) => {
  if (!value) return 'Chưa cập nhật';
  return GRADUATION_STATUS_VI_LABELS[value as GraduationStatus] ?? value;
};
