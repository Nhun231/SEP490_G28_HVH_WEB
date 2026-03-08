export enum EOrgType {
  SOCIAL_FUND = 'SOCIAL_FUND',
  CHARITY_FUND = 'CHARITY_FUND',
  NGO = 'NGO',
  SOCIAL_ORGANIZATION = 'SOCIAL_ORGANIZATION',
  GOVERNMENT_AGENCY_BASED = 'GOVERNMENT_AGENCY_BASED',
  PUBLIC_SERVICE_UNIT_BASED = 'PUBLIC_SERVICE_UNIT_BASED',
  MASS_ORGANIZATION = 'MASS_ORGANIZATION',
  UNIVERSITY_BASED = 'UNIVERSITY_BASED',
  GENERAL_EDUCATION_BASED = 'GENERAL_EDUCATION_BASED',
  STATE_OWNED_ENTERPRISE_BASED = 'STATE_OWNED_ENTERPRISE_BASED',
  PRIVATE_ENTERPRISE_BASED = 'PRIVATE_ENTERPRISE_BASED',
  SELF_GOVERNED_ORGANIZATION = 'SELF_GOVERNED_ORGANIZATION',
  OTHER = 'OTHER'
}

export interface OrgTypeOption {
  value: EOrgType;
  label: string;
}

export const REGISTERED_ORG_TYPE_OPTIONS: OrgTypeOption[] = [
  { value: EOrgType.SOCIAL_FUND, label: 'Quỹ xã hội' },
  { value: EOrgType.CHARITY_FUND, label: 'Quỹ từ thiện' },
  { value: EOrgType.NGO, label: 'Tổ chức phi chính phủ' },
  { value: EOrgType.SOCIAL_ORGANIZATION, label: 'Tổ chức xã hội' }
];

export const UNREGISTERED_ORG_TYPE_OPTIONS: OrgTypeOption[] = [
  {
    value: EOrgType.GOVERNMENT_AGENCY_BASED,
    label: 'Được thành lập trong cơ quan chính quyền'
  },
  {
    value: EOrgType.PUBLIC_SERVICE_UNIT_BASED,
    label: 'Được thành lập trong đơn vị sự nghiệp công lập'
  },
  {
    value: EOrgType.MASS_ORGANIZATION,
    label: 'Tổ chức quần chúng (phường, xã, làng)'
  },
  {
    value: EOrgType.UNIVERSITY_BASED,
    label: 'Được thành lập trong trường đại học'
  },
  {
    value: EOrgType.GENERAL_EDUCATION_BASED,
    label: 'Được thành lập trong cơ sở giáo dục phổ thông'
  },
  {
    value: EOrgType.STATE_OWNED_ENTERPRISE_BASED,
    label: 'Được thành lập trong doanh nghiệp nhà nước'
  },
  {
    value: EOrgType.PRIVATE_ENTERPRISE_BASED,
    label: 'Được thành lập trong doanh nghiệp tư nhân'
  },
  {
    value: EOrgType.SELF_GOVERNED_ORGANIZATION,
    label: 'Tổ chức xã hội tự quản'
  },
  { value: EOrgType.OTHER, label: 'Khác' }
];

export const ORG_TYPE_OPTIONS = [
  ...REGISTERED_ORG_TYPE_OPTIONS,
  ...UNREGISTERED_ORG_TYPE_OPTIONS
];

export const ORG_TYPE_LABELS: Record<EOrgType, string> =
  ORG_TYPE_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EOrgType, string>
  );
