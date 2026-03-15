export enum EEducationLevel {
  SECONDARY = 'SECONDARY',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  COLLEGE = 'COLLEGE',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
  PROFESSIONAL = 'PROFESSIONAL',
  OTHER = 'OTHER'
}

export interface EducationLevelOption {
  value: EEducationLevel;
  label: string;
}

export const EDUCATION_LEVEL_OPTIONS: EducationLevelOption[] = [
  { value: EEducationLevel.SECONDARY, label: 'Trung học cơ sở' },
  { value: EEducationLevel.HIGH_SCHOOL, label: 'Trung học phổ thông' },
  { value: EEducationLevel.COLLEGE, label: 'Cao đẳng' },
  { value: EEducationLevel.UNDERGRADUATE, label: 'Đại học' },
  { value: EEducationLevel.POSTGRADUATE, label: 'Sau đại học' },
  { value: EEducationLevel.PROFESSIONAL, label: 'Chuyên môn' },
  { value: EEducationLevel.OTHER, label: 'Khác' }
];

export const EDUCATION_LEVEL_LABELS: Record<EEducationLevel, string> =
  EDUCATION_LEVEL_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EEducationLevel, string>
  );
