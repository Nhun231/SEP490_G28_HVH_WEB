import { EEventStatus, EVENT_STATUS_LABELS } from './event-status';

// Mapping badge color for each event status (by status code)
export const EVENT_BADGE_CLASSNAME_BY_STATUS: Record<EEventStatus, string> = {
  [EEventStatus.EDITING]:
    'rounded-full bg-gray-400 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.SUBMITTED]:
    'rounded-full bg-blue-500 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.APPROVED_BY_MNG]:
    'rounded-full bg-green-600 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.REJECTED_BY_MNG]:
    'rounded-full bg-red-400 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.REJECTED_BY_AD]:
    'rounded-full bg-red-700 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.RECRUITING]:
    'rounded-full bg-blue-600 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.UPCOMING]:
    'rounded-full bg-yellow-400 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.ONGOING]:
    'rounded-full bg-green-600 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.ENDED]:
    'rounded-full bg-red-600 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.COMPLETED]:
    'rounded-full bg-black text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap',
  [EEventStatus.CANCELLED]:
    'rounded-full bg-zinc-500 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap'
};

// Helper: get badge class by status code or label
export function getBadgeClassNameByStatus(status: string): string {
  // Try by status code
  if (EVENT_BADGE_CLASSNAME_BY_STATUS[status as EEventStatus]) {
    return EVENT_BADGE_CLASSNAME_BY_STATUS[status as EEventStatus];
  }
  // Try by label
  const found = Object.entries(EVENT_STATUS_LABELS).find(
    ([, label]) => label === status
  );
  if (found) {
    return EVENT_BADGE_CLASSNAME_BY_STATUS[found[0] as EEventStatus];
  }
  // Default
  return 'rounded-full bg-zinc-500 text-white font-medium px-1.5 py-0 text-[10px] whitespace-nowrap';
}
