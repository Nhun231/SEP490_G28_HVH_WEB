import { EEventStatus, EVENT_STATUS_LABELS } from './event-status';

// Mapping badge color for each event status (by status code)
export const EVENT_BADGE_CLASSNAME_BY_STATUS: Record<EEventStatus, string> = {
  [EEventStatus.EDITING]:
    'rounded-full bg-gray-400 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-500',
  [EEventStatus.SUBMITTED]:
    'rounded-full bg-blue-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-blue-600',
  [EEventStatus.APPROVED_BY_MNG]:
    'rounded-full bg-green-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-green-700',
  [EEventStatus.REJECTED_BY_MNG]:
    'rounded-full bg-red-400 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-red-500',
  [EEventStatus.REJECTED_BY_AD]:
    'rounded-full bg-red-700 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-red-800',
  [EEventStatus.RECRUITING]:
    'rounded-full bg-blue-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-blue-700',
  [EEventStatus.UPCOMING]:
    'rounded-full bg-yellow-400 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-yellow-500',
  [EEventStatus.ONGOING]:
    'rounded-full bg-green-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-green-700',
  [EEventStatus.ENDED]:
    'rounded-full bg-red-600 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-red-700',
  [EEventStatus.COMPLETED]:
    'rounded-full bg-black text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-zinc-900',
  [EEventStatus.CANCELLED]:
    'rounded-full bg-zinc-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-zinc-600'
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
  return 'rounded-full bg-zinc-500 text-white font-semibold px-3 py-0.5 text-xs';
}
