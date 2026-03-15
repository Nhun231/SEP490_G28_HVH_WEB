export enum EServingPlaceType {
  SCHOOL = 'SCHOOL',
  REMOTE_AREA = 'REMOTE_AREA',
  PARK_OR_SQUARE = 'PARK_OR_SQUARE',
  HOSPITAL = 'HOSPITAL',
  TRANSPORT_STATION = 'TRANSPORT_STATION',
  MUSEUM = 'MUSEUM',
  NURSING_HOME = 'NURSING_HOME',
  TOURIST_AREA = 'TOURIST_AREA',
  WATER_BODY = 'WATER_BODY',
  SPORTS_AREA = 'SPORTS_AREA',
  CEMETERY = 'CEMETERY',
  OTHER = 'OTHER'
}

export interface ServingPlaceTypeOption {
  value: EServingPlaceType;
  label: string;
}

export const SERVING_PLACE_TYPE_OPTIONS: ServingPlaceTypeOption[] = [
  { value: EServingPlaceType.SCHOOL, label: 'Trường học' },
  { value: EServingPlaceType.REMOTE_AREA, label: 'Vùng sâu vùng xa' },
  { value: EServingPlaceType.PARK_OR_SQUARE, label: 'Công viên, quảng trường' },
  { value: EServingPlaceType.HOSPITAL, label: 'Bệnh viện' },
  { value: EServingPlaceType.TRANSPORT_STATION, label: 'Trạm giao thông' },
  { value: EServingPlaceType.MUSEUM, label: 'Bảo tàng' },
  { value: EServingPlaceType.NURSING_HOME, label: 'Viện dưỡng lão' },
  { value: EServingPlaceType.TOURIST_AREA, label: 'Khu du lịch' },
  { value: EServingPlaceType.WATER_BODY, label: 'Mặt nước, sông ngòi' },
  { value: EServingPlaceType.SPORTS_AREA, label: 'Khu thể dục thể thao' },
  { value: EServingPlaceType.CEMETERY, label: 'Nghĩa trang' },
  { value: EServingPlaceType.OTHER, label: 'Khác' }
];

export const SERVING_PLACE_TYPE_LABELS: Record<EServingPlaceType, string> =
  SERVING_PLACE_TYPE_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<EServingPlaceType, string>
  );
