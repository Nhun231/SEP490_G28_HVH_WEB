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
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { IRoute } from '@/types/types';

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
}

const mockPendingEvents = [
  {
    id: 1,
    eventName: 'Chương trình tình nguyện môi trường',
    organizer: 'Tổ chức Xanh Việt',
    date: '15/03/2026',
    location: 'Công viên Tao Đàn, TPHCM',
    volunteers: 45,
    submittedDate: '10/02/2026',
    status: 'Chờ phê duyệt'
  },
  {
    id: 2,
    eventName: 'Hỗ trợ cộng đồng địa phương',
    organizer: 'Hội chữ Thập Đỏ',
    date: '22/03/2026',
    location: 'Huyện Nhà Bè',
    volunteers: 30,
    submittedDate: '05/02/2026',
    status: 'Chờ phê duyệt'
  },
  {
    id: 3,
    eventName: 'Giáo dục cho trẻ em vùng cao',
    organizer: 'Quỹ Phúc Lợi Xã Hội',
    date: '28/03/2026',
    location: 'Tỉnh Yên Bái',
    volunteers: 60,
    submittedDate: '01/02/2026',
    status: 'Chờ phê duyệt'
  },
  {
    id: 4,
    eventName: 'Hiến máu nhân đạo mùa xuân',
    organizer: 'Hội chữ Thập Đỏ',
    date: '05/01/2026',
    location: 'Quận Đống Đa, Hà Nội',
    volunteers: 80,
    submittedDate: '15/12/2025',
    status: 'Đang tuyển quân'
  },
  {
    id: 5,
    eventName: 'Trồng cây gây rừng ven đô',
    organizer: 'Tổ chức Xanh Việt',
    date: '10/02/2026',
    location: 'Sóc Sơn, Hà Nội',
    volunteers: 120,
    submittedDate: '20/12/2025',
    status: 'Đã đóng đơn'
  },
  {
    id: 6,
    eventName: 'Khám sức khỏe cộng đồng',
    organizer: 'Hội chữ Thập Đỏ',
    date: '04/03/2026',
    location: 'Quận Hai Bà Trưng, Hà Nội',
    volunteers: 35,
    submittedDate: '10/01/2026',
    status: 'Đang diễn ra'
  },
  {
    id: 7,
    eventName: 'Tủ sách cho em',
    organizer: 'Quỹ Phúc Lợi Xã Hội',
    date: '15/01/2026',
    location: 'Tỉnh Yên Bái',
    volunteers: 25,
    submittedDate: '20/12/2025',
    status: 'Đã kết thúc'
  }
];

export default function PendingEvents({
  user,
  userDetails,
  detailBasePath = '/dashboard/pending-events',
  routes,
  colorVariant,
  signInPath,
  shellClassName,
  statusFilter = 'Chờ phê duyệt',
  statusFilters,
  pageTitle = 'Sự kiện chờ phê duyệt',
  pageDescription = 'Danh sách các sự kiện đang chờ phê duyệt',
  emptyStateText = 'Không có sự kiện chờ phê duyệt',
  badgeText = 'Chờ phê duyệt',
  badgeFromStatus = false,
  badgeClassName = 'rounded-full bg-gray-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-400',
  badgeClassNameByStatus
}: Props) {
  type PendingEvent = (typeof mockPendingEvents)[0];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');
  const [submittedDateFrom, setSubmittedDateFrom] = useState('');
  const [submittedDateTo, setSubmittedDateTo] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const pageSize = 10;

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

  const getFilterValueForKey = (event: PendingEvent, key: ValueFilterKey) => {
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
  };

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const unique = new Set<string>();
    mockPendingEvents.forEach((e) => unique.add(getFilterValueForKey(e, key)));
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
      return values.filter((v) => {
        const nv = normalizeText(v);
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
                      <span className="truncate">{v}</span>
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
    const allowedStatuses =
      statusFilters && statusFilters.length > 0
        ? statusFilters
        : [statusFilter];

    let result = mockPendingEvents.filter((event) =>
      allowedStatuses.includes(event.status)
    );

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
    statusFilters
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
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50">
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Tên sự kiện</span>
                    <ValueFilterDropdown
                      columnKey="eventName"
                      label="Tên sự kiện"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Tổ chức</span>
                    <ValueFilterDropdown
                      columnKey="organizer"
                      label="Tổ chức"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Địa điểm</span>
                    <ValueFilterDropdown
                      columnKey="location"
                      label="Địa điểm"
                    />
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
                    <TableCell className="text-zinc-600">
                      {event.organizer}
                    </TableCell>
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
                        const text = badgeFromStatus ? event.status : badgeText;
                        const className =
                          badgeFromStatus &&
                          badgeClassNameByStatus?.[event.status]
                            ? badgeClassNameByStatus[event.status]
                            : badgeClassName;

                        return <Badge className={className}>{text}</Badge>;
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-zinc-500"
                  >
                    {emptyStateText}
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
