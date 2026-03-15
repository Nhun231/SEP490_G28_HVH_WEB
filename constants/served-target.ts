export enum EServedTarget {
  WOMEN = 'WOMEN',
  CHILDREN = 'CHILDREN',
  ADOLESCENTS = 'ADOLESCENTS',
  ADULTS = 'ADULTS',
  ELDERLY = 'ELDERLY',
  PEOPLE_WITH_DISABILITIES = 'PEOPLE_WITH_DISABILITIES',
  VULNERABLE_GROUPS = 'VULNERABLE_GROUPS',
  UNSPECIFIED = 'UNSPECIFIED'
}

export interface ServedTargetOption {
  value: EServedTarget;
  label: string;
}

export const SERVED_TARGET_OPTIONS: ServedTargetOption[] = [
  { value: EServedTarget.WOMEN, label: 'Phụ nữ' },
  { value: EServedTarget.CHILDREN, label: 'Trẻ em' },
  { value: EServedTarget.ADOLESCENTS, label: 'Thanh thiếu niên' },
  { value: EServedTarget.ADULTS, label: 'Trung niên' },
  { value: EServedTarget.ELDERLY, label: 'Người cao tuổi' },
  { value: EServedTarget.PEOPLE_WITH_DISABILITIES, label: 'Người tàn tật' },
  {
    value: EServedTarget.VULNERABLE_GROUPS,
    label: 'Người yếu thế, hoàn cảnh khó khăn'
  },
  { value: EServedTarget.UNSPECIFIED, label: 'Không xác định' }
];

export const SERVED_TARGET_LABELS: Record<EServedTarget, string> =
  SERVED_TARGET_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EServedTarget, string>
  );
