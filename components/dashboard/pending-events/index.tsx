'use client';

import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown,
  ArrowUp,
  Filter as Funnel,
  ListFilter,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { IRoute } from '@/types/types';
import type { PendingEventsResponse } from '@/hooks/dto';
import { EEventStatus, EVENT_STATUS_LABELS } from '@/constants/event-status';
import { getBadgeClassNameByStatus } from '@/constants/event-badge-status';
// Data fetching is now handled outside this component. Only presentational logic remains.

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  detailBasePath?: string;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  shellClassName?: string;
  statusFilter?: string;
  statusFilters?: string[];
  pageTitle?: string;
  pageDescription?: string;
  emptyStateText?: string;
  badgeText?: string;
  badgeFromStatus?: boolean;
  badgeClassName?: string;
  badgeClassNameByStatus?: Partial<Record<string, string>>;
  topHelperText?: string;
  notificationButton?: {
    permission: 'granted' | 'denied' | 'default' | 'unsupported';
    isLoading: boolean;
    isMounted: boolean;
    onRequest: () => void;
  };
  externalData?: PendingEventsResponse | null;
  externalIsLoading?: boolean;
  externalError?: Error | null;
}

interface PendingEvent {
  id: string;
  eventName: string;
  organizer: string;
  date: string;
  location: string;
  volunteers: number;
  submittedDate: string;
  status: string;
}

const formatDisplayDate = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '-';
  }

  const trimmed = value.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
};

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return '';
};

const getEventListFromResponse = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const source = payload as Record<string, unknown>;
  const directCandidates = [
    source.items,
    source.data,
    source.content,
    source.results,
    source.records,
    source.events
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as Record<string, unknown>;
    const nestedCandidates = [
      nested.items,
      nested.content,
      nested.results,
      nested.records,
      nested.events
    ];
    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
};

export default function PendingEvents({
  user,
  userDetails,
  detailBasePath = '/dashboard/pending-events',
  routes,
  colorVariant,
  signInPath,
  shellClassName,
  statusFilter = 'APPROVED_BY_MNG',
  statusFilters,
  pageTitle = 'Sự kiện chờ phê duyệt',
  pageDescription = 'Danh sách các sự kiện đang chờ phê duyệt',
  emptyStateText = 'Không có sự kiện chờ phê duyệt',
  badgeText = 'Chờ phê duyệt',
  badgeFromStatus = false,
  badgeClassName = 'rounded-full bg-gray-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-400',
  badgeClassNameByStatus,
  topHelperText,
  notificationButton,
  externalData,
  externalIsLoading,
  externalError
}: Props) {
  type SortKey =
    | 'eventName'
    | 'organizer'
    | 'location'
    | 'date'
    | 'submittedDate'
    | 'status';
  type SortOrder = 'asc' | 'desc';
  type SortCriterion = { key: SortKey; order: SortOrder };
  type ValueFilterKey = 'eventName' | 'organizer' | 'location' | 'status';

  const router = useRouter();
  const hideOrganizerColumn = colorVariant === 'organizer';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');
  const [submittedDateFrom, setSubmittedDateFrom] = useState('');
  const [submittedDateTo, setSubmittedDateTo] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const pageSize = 10;

  // Data, loading, and error are now always controlled by parent via props
  const pendingEventsResponse = externalData;
  const isPendingEventsLoading = externalIsLoading ?? false;
  const pendingEventsError = externalError ?? null;

  const pendingEvents = useMemo<PendingEvent[]>(() => {
    const rawList = getEventListFromResponse(pendingEventsResponse);

    return rawList
      .map((item, index) => {
        const row = (item ?? {}) as Record<string, unknown>;
        const org =
          row.organization && typeof row.organization === 'object'
            ? (row.organization as Record<string, unknown>)
            : null;

        const id = getString(row.id, row.eventId, row.event_id, row.code);
        const eventName = getString(row.eventName, row.name, row.title);
        const organizer = getString(
          row.organizer,
          row.organizerName,
          row.organizationName,
          org?.name
        );
        const location = getString(
          row.location,
          row.locationName,
          row.region,
          row.address
        );
        const date = formatDisplayDate(
          row.date ?? row.eventDate ?? row.startDate ?? row.startedAt
        );
        const submittedDate = formatDisplayDate(
          row.submittedDate ?? row.createdAt ?? row.created_at
        );
        const status =
          getString(row.status, row.statusName, row.eventStatus) ||
          statusFilter;

        const volunteersRaw =
          typeof row.volunteers === 'number'
            ? row.volunteers
            : typeof row.totalVolunteers === 'number'
              ? row.totalVolunteers
              : 0;

        if (!id || !eventName) {
          return null;
        }

        return {
          id: id || String(index),
          eventName,
          organizer: organizer || '-',
          date,
          location: location || '-',
          volunteers: volunteersRaw,
          submittedDate,
          status
        } satisfies PendingEvent;
      })
      .filter((event): event is PendingEvent => Boolean(event));
  }, [pendingEventsResponse, statusFilter]);

  const setSortForKey = (key: SortKey, order: SortOrder) => {
    setSortCriteria((prev) => {
      const next = prev.filter((c) => c.key !== key);
      next.unshift({ key, order });
      return next;
    });
    setCurrentPage(1);
  };

  const clearSortForKey = (key: SortKey) => {
    setSortCriteria((prev) => prev.filter((c) => c.key !== key));
    setCurrentPage(1);
  };

  const normalizeForFilter = (value: unknown) => String(value ?? '').trim();

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const parseDmy = (value: string) => {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const parseYmdStartOfDay = (ymd: string) => {
    const [year, month, day] = ymd.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const parseYmdEndOfDay = (ymd: string) => {
    const [year, month, day] = ymd.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  };

  const getFilterValueForKey = useCallback(
    (event: PendingEvent, key: ValueFilterKey) => {
      switch (key) {
        case 'eventName':
          return normalizeForFilter(event.eventName);
        case 'organizer':
          return normalizeForFilter(event.organizer);
        case 'location':
          return normalizeForFilter(event.location);
        case 'status':
          return normalizeForFilter(event.status);
        default:
          return '';
      }
    },
    []
  );

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const unique = new Set<string>();
    pendingEvents.forEach((e) => unique.add(getFilterValueForKey(e, key)));
    // For status, return array of values sorted by label
    if (key === 'status') {
      return Array.from(unique).sort((a, b) => {
        const labelA = EVENT_STATUS_LABELS[a as EEventStatus] || a;
        const labelB = EVENT_STATUS_LABELS[b as EEventStatus] || b;
        return labelA.localeCompare(labelB, 'vi', { sensitivity: 'base' });
      });
    }
    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b, 'vi', { sensitivity: 'base' })
    );
  };

  const ValueFilterDropdown = (props: {
    columnKey: ValueFilterKey;
    label: string;
  }) => {
    const { columnKey, label } = props;
    const values = useMemo(
      () => getUniqueValuesForKey(columnKey),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;

    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) &&
      (columnKey === 'eventName' ||
        columnKey === 'organizer' ||
        columnKey === 'location');
    const isSortActive = sortCriteria.some((c) => c.key === columnKey);
    const isActive =
      hasActiveFilter || isSearchFilteringThisColumn || isSortActive;

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [localSelected, setLocalSelected] = useState<string[]>(applied);

    const filteredValues = useMemo(() => {
      const q = normalizeText(search);
      if (!q) return values;
      const tokens = q.split(' ').filter(Boolean);
      if (columnKey === 'status') {
        return values.filter((v) => {
          const nv = normalizeText(EVENT_STATUS_LABELS[v as EEventStatus] || v);
          return tokens.every((t) => nv.includes(t));
        });
      }
      return values.filter((v) => {
        const nv = normalizeText(typeof v === 'string' ? v : '');
        return tokens.every((t) => nv.includes(t));
      });
    }, [values, search]);

    const setApplied = (next: string[]) => {
      setColumnValueFilters((prev) => ({
        ...prev,
        [columnKey]: next
      }));
      setCurrentPage(1);
    };

    return (
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setSearch('');
            setLocalSelected(applied);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
            aria-label={`Bộ lọc cột ${label}`}
          >
            {isActive ? (
              <Funnel className="h-4 w-4" />
            ) : (
              <ListFilter className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[320px] p-2 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey(columnKey, 'asc');
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp A đến Z
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey(columnKey, 'desc');
            }}
            className="gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Sắp xếp Z đến A
          </DropdownMenuItem>

          {isSortActive ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  clearSortForKey(columnKey);
                }}
                className="gap-2 text-zinc-600 data-[highlighted]:bg-zinc-50 data-[highlighted]:text-zinc-900"
              >
                <X className="h-4 w-4" />
                Xóa sắp xếp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuSeparator />
          )}

          <div className="px-1 pb-2">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setLocalSelected(values)}
              >
                Chọn tất cả {values.length ? values.length : ''}
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm text-destructive"
                onClick={() => setLocalSelected([])}
              >
                Xóa
              </Button>
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm"
                className="h-8 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="mt-2 max-h-56 overflow-auto rounded-md border border-zinc-200 bg-white">
              {filteredValues.length === 0 ? (
                <div className="p-3 text-sm text-zinc-500">
                  Không có kết quả
                </div>
              ) : (
                filteredValues.map((v) => {
                  const checked = localSelected.includes(v);
                  const label =
                    columnKey === 'status'
                      ? EVENT_STATUS_LABELS[v as EEventStatus] || v
                      : v;
                  return (
                    <button
                      key={v}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setLocalSelected((prev) =>
                          prev.includes(v)
                            ? prev.filter((x) => x !== v)
                            : [...prev, v]
                        );
                      }}
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                          checked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-white border-zinc-300'
                        }`}
                      >
                        {checked ? '✓' : ''}
                      </span>
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                onClick={() => {
                  setOpen(false);
                  setLocalSelected(applied);
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setLocalSelected(filteredValues)}
              >
                Chọn tất cả {filteredValues.length ? filteredValues.length : ''}
              </Button>
              <Button
                type="button"
                className="h-9"
                onClick={() => {
                  setApplied(localSelected);
                  setOpen(false);
                }}
              >
                OK
              </Button>
            </div>

            {hasActiveFilter && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-full justify-start gap-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={() => {
                    setApplied([]);
                    setOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc cột
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const DateRangeFilterDropdown = (props: {
    sortKey: 'date' | 'submittedDate';
    label: string;
    from: string;
    to: string;
    setFrom: (v: string) => void;
    setTo: (v: string) => void;
  }) => {
    const { sortKey, label, from, to, setFrom, setTo } = props;
    const [open, setOpen] = useState(false);
    const [localFrom, setLocalFrom] = useState(from);
    const [localTo, setLocalTo] = useState(to);
    const hasActive = Boolean(from || to);
    const isSortActive = sortCriteria.some((c) => c.key === sortKey);
    const isActive = hasActive || isSortActive;

    return (
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setLocalFrom(from);
            setLocalTo(to);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
            aria-label={`Bộ lọc cột ${label}`}
          >
            {isActive ? (
              <Funnel className="h-4 w-4" />
            ) : (
              <ListFilter className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[320px] p-2 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey(sortKey, 'asc');
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey(sortKey, 'desc');
            }}
            className="gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Sắp xếp giảm dần
          </DropdownMenuItem>

          {isSortActive ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  clearSortForKey(sortKey);
                }}
                className="gap-2 text-zinc-600 data-[highlighted]:bg-zinc-50 data-[highlighted]:text-zinc-900"
              >
                <X className="h-4 w-4" />
                Xóa sắp xếp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuSeparator />
          )}

          <div className="px-1 pb-2">
            <p className="text-sm font-medium text-zinc-900">
              Lọc theo khoảng ngày
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Input
                type="date"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                onClick={() => {
                  setOpen(false);
                  setLocalFrom(from);
                  setLocalTo(to);
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="h-9"
                onClick={() => {
                  setFrom(localFrom);
                  setTo(localTo);
                  setCurrentPage(1);
                  setOpen(false);
                }}
              >
                OK
              </Button>
            </div>

            {hasActive && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-full justify-start gap-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={() => {
                    setFrom('');
                    setTo('');
                    setCurrentPage(1);
                    setOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc cột
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const filteredEvents = useMemo(() => {
    let result = pendingEvents;

    const q = normalizeText(searchQuery.trim());
    if (q) {
      const tokens = q.split(' ').filter(Boolean);
      result = result.filter((event) => {
        const hay = normalizeText(
          `${event.eventName} ${event.organizer} ${event.location}`
        );
        return tokens.every((t) => hay.includes(t));
      });
    }

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      result = result.filter((event) => {
        const v = getFilterValueForKey(event, key);
        return selected.includes(v);
      });
    });

    const eventFrom = eventDateFrom ? parseYmdStartOfDay(eventDateFrom) : null;
    const eventTo = eventDateTo ? parseYmdEndOfDay(eventDateTo) : null;
    if (eventFrom || eventTo) {
      result = result.filter((event) => {
        const d = parseDmy(event.date);
        if (eventFrom && d < eventFrom) return false;
        if (eventTo && d > eventTo) return false;
        return true;
      });
    }

    const submittedFrom = submittedDateFrom
      ? parseYmdStartOfDay(submittedDateFrom)
      : null;
    const submittedTo = submittedDateTo
      ? parseYmdEndOfDay(submittedDateTo)
      : null;
    if (submittedFrom || submittedTo) {
      result = result.filter((event) => {
        const d = parseDmy(event.submittedDate);
        if (submittedFrom && d < submittedFrom) return false;
        if (submittedTo && d > submittedTo) return false;
        return true;
      });
    }

    if (sortCriteria.length > 0) {
      result = [...result].sort((a, b) => {
        for (const criterion of sortCriteria) {
          const { key, order } = criterion;

          let cmp = 0;
          if (key === 'date' || key === 'submittedDate') {
            const da = parseDmy(a[key]);
            const db = parseDmy(b[key]);
            cmp = da.getTime() - db.getTime();
          } else {
            const va = normalizeText(String(a[key] ?? ''));
            const vb = normalizeText(String(b[key] ?? ''));
            cmp = va.localeCompare(vb, 'vi', { sensitivity: 'base' });
          }

          if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    return result;
  }, [
    searchQuery,
    columnValueFilters,
    eventDateFrom,
    eventDateTo,
    submittedDateFrom,
    submittedDateTo,
    sortCriteria,
    statusFilter,
    statusFilters,
    getFilterValueForKey,
    pendingEvents
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    columnValueFilters,
    eventDateFrom,
    eventDateTo,
    submittedDateFrom,
    submittedDateTo,
    sortCriteria
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title={pageTitle}
      description={pageDescription}
      routes={routes}
      colorVariant={colorVariant}
      signInPath={signInPath}
      shellClassName={shellClassName}
    >
      <div className="w-full max-w-none">
        {topHelperText ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <p className="text-sm text-zinc-500">{topHelperText}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6"></div>
        )}

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Button yêu cầu quyền thông báo */}
        {notificationButton && notificationButton.isMounted && (
          <div className="mb-6">
            <button
              onClick={notificationButton.onRequest}
              disabled={
                notificationButton.permission === 'granted' ||
                notificationButton.permission === 'unsupported' ||
                notificationButton.isLoading
              }
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                notificationButton.permission === 'granted'
                  ? 'bg-green-600 cursor-not-allowed opacity-75'
                  : notificationButton.permission === 'unsupported'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {notificationButton.isLoading
                ? 'Đang yêu cầu...'
                : notificationButton.permission === 'granted'
                  ? '✓ Đã cấp quyền thông báo'
                  : '🔔 Yêu cầu quyền thông báo'}
            </button>
          </div>
        )}

        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow
                className={cn(
                  'border-b border-zinc-200 bg-zinc-50',
                  colorVariant === 'organizer'
                    ? 'hover:bg-zinc-100'
                    : 'hover:bg-muted/50'
                )}
              >
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Tên sự kiện</span>
                    <ValueFilterDropdown
                      columnKey="eventName"
                      label="Tên sự kiện"
                    />
                  </div>
                </TableHead>
                {!hideOrganizerColumn && (
                  <TableHead className="text-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>Tổ chức</span>
                      <ValueFilterDropdown
                        columnKey="organizer"
                        label="Tổ chức"
                      />
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Khu vực</span>
                    <ValueFilterDropdown columnKey="location" label="Khu vực" />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Ngày diễn ra</span>
                    <DateRangeFilterDropdown
                      sortKey="date"
                      label="Ngày diễn ra"
                      from={eventDateFrom}
                      to={eventDateTo}
                      setFrom={setEventDateFrom}
                      setTo={setEventDateTo}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Ngày nộp</span>
                    <DateRangeFilterDropdown
                      sortKey="submittedDate"
                      label="Ngày nộp"
                      from={submittedDateFrom}
                      to={submittedDateTo}
                      setFrom={setSubmittedDateFrom}
                      setTo={setSubmittedDateTo}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Trạng thái</span>
                    <ValueFilterDropdown
                      columnKey="status"
                      label="Trạng thái"
                    />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className={cn(
                      'border-b border-zinc-200 cursor-pointer',
                      selectedEventId === event.id ? 'bg-zinc-50' : '',
                      'hover:bg-zinc-50'
                    )}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      router.push(`${detailBasePath}/${event.id}`);
                    }}
                  >
                    <TableCell className="font-medium text-zinc-900">
                      {event.eventName}
                    </TableCell>
                    {!hideOrganizerColumn && (
                      <TableCell className="text-zinc-600">
                        {event.organizer}
                      </TableCell>
                    )}
                    <TableCell className="text-zinc-600">
                      {event.location}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {event.date}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {event.submittedDate}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Always use label for text, and get class by status code or label
                        const text = badgeFromStatus
                          ? EVENT_STATUS_LABELS[event.status as EEventStatus] ||
                            event.status
                          : badgeText;
                        const className = badgeFromStatus
                          ? getBadgeClassNameByStatus(event.status)
                          : badgeClassName;
                        return <Badge className={className}>{text}</Badge>;
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={hideOrganizerColumn ? 5 : 6}
                    className="py-8 text-center text-zinc-500"
                  >
                    {pendingEventsError
                      ? 'Không thể tải danh sách sự kiện.'
                      : isPendingEventsLoading
                        ? 'Đang tải danh sách sự kiện...'
                        : emptyStateText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
