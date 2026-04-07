'use client';

import DashboardLayout from '@/components/layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { User } from '@supabase/supabase-js';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Filter as Funnel,
  ListFilter,
  Plus,
  Search,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IRoute } from '@/types/types';
import { useViewHostList } from '@/hooks/features/uc065-view-host-list/useViewHostList';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
}

type HostStatus = 'Hoạt động' | 'Ngừng hoạt động';

type HostRow = {
  id: string;
  name: string;
  district: string;
  email: string;
  phone: string;
  status: HostStatus;
  eventCount: number;
  hours: number;
};

const pageSize = 10;

export default function OrganizerHostManagement({
  user,
  userDetails,
  routes,
  colorVariant = 'organizer',
  signInPath = '/signin/password_signin'
}: Props) {
  type SortKey = 'name' | 'district' | 'email' | 'phone' | 'status' | 'hours';
  type SortOrder = 'asc' | 'desc';
  type SortCriterion = { key: SortKey; order: SortOrder };
  type ValueFilterKey = 'name' | 'district' | 'email' | 'phone' | 'status';
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const [statusOverrides, setStatusOverrides] = useState<
    Partial<Record<string, HostStatus>>
  >({});
  const [confirmActionHost, setConfirmActionHost] = useState<HostRow | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const {
    data: hostListData,
    isLoading: isHostListLoading,
    error: hostListError
  } = useViewHostList({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    baseUrl,
    enabled: Boolean(user)
  });

  const mapApiStatusToHostStatus = (status: string | null): HostStatus =>
    status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động';

  const hosts = useMemo<HostRow[]>(() => {
    const content = hostListData?.content ?? [];

    return content.map((item) => ({
      id: item.id,
      name: item.fullName?.trim() || 'Chưa cập nhật',
      district: item.address?.trim() || '-',
      email: item.email?.trim() || '-',
      phone: item.phone?.trim() || '-',
      status: statusOverrides[item.id] ?? mapApiStatusToHostStatus(item.status),
      eventCount: item.hostedEventCount,
      hours: 0
    }));
  }, [hostListData?.content, statusOverrides]);

  const setSortForKey = (key: SortKey, order: SortOrder) => {
    setSortCriteria((prev) => {
      const next = prev.filter((criterion) => criterion.key !== key);
      next.unshift({ key, order });
      return next;
    });
    setCurrentPage(1);
  };

  const clearSortForKey = (key: SortKey) => {
    setSortCriteria((prev) =>
      prev.filter((criterion) => criterion.key !== key)
    );
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

  const getFilterValueForKey = useCallback(
    (host: HostRow, key: ValueFilterKey) => {
      switch (key) {
        case 'name':
          return normalizeForFilter(host.name);
        case 'district':
          return normalizeForFilter(host.district);
        case 'email':
          return normalizeForFilter(host.email);
        case 'phone':
          return normalizeForFilter(host.phone);
        case 'status':
          return normalizeForFilter(host.status);
        default:
          return '';
      }
    },
    []
  );

  const getUniqueValuesForKey = useCallback(
    (key: ValueFilterKey) => {
      const unique = new Set<string>();
      hosts.forEach((host) => unique.add(getFilterValueForKey(host, key)));
      return Array.from(unique).sort((a, b) =>
        a.localeCompare(b, 'vi', { sensitivity: 'base' })
      );
    },
    [getFilterValueForKey, hosts]
  );

  const toggleHostStatus = (hostId: string) => {
    const targetHost = hosts.find((host) => host.id === hostId);
    if (!targetHost) return;

    setStatusOverrides((prev) => ({
      ...prev,
      [hostId]:
        targetHost.status === 'Hoạt động' ? 'Ngừng hoạt động' : 'Hoạt động'
    }));
  };

  const confirmActionText =
    confirmActionHost?.status === 'Hoạt động'
      ? 'Khóa tài khoản'
      : 'Mở khóa tài khoản';

  const ValueFilterDropdown = (props: {
    columnKey: ValueFilterKey;
    label: string;
  }) => {
    const { columnKey, label } = props;
    const values = useMemo(() => getUniqueValuesForKey(columnKey), [columnKey]);
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) &&
      (columnKey === 'name' ||
        columnKey === 'district' ||
        columnKey === 'email' ||
        columnKey === 'phone');
    const isSortActive = sortCriteria.some(
      (criterion) => criterion.key === columnKey
    );
    const isActive =
      hasActiveFilter || isSearchFilteringThisColumn || isSortActive;

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [localSelected, setLocalSelected] = useState<string[]>(applied);

    const filteredValues = useMemo(() => {
      const query = normalizeText(search);
      if (!query) return values;
      const tokens = query.split(' ').filter(Boolean);
      return values.filter((value) => {
        const normalizedValue = normalizeText(value);
        return tokens.every((token) => normalizedValue.includes(token));
      });
    }, [search, values]);

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
          className="w-[320px] border border-zinc-200 bg-white p-2 text-zinc-900 shadow-lg"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setSortForKey(columnKey, 'asc');
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp A đến Z
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
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
                onSelect={(event) => {
                  event.preventDefault();
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
                onChange={(event) => setSearch(event.target.value)}
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
                filteredValues.map((value) => {
                  const checked = localSelected.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setLocalSelected((prev) =>
                          prev.includes(value)
                            ? prev.filter((item) => item !== value)
                            : [...prev, value]
                        );
                      }}
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                          checked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {checked ? '✓' : ''}
                      </span>
                      <span className="truncate">{value}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
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

  const filteredHosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let next = hosts.filter((host) => {
      const matchesQuery =
        !normalizedQuery ||
        host.name.toLowerCase().includes(normalizedQuery) ||
        host.district.toLowerCase().includes(normalizedQuery) ||
        host.email.toLowerCase().includes(normalizedQuery) ||
        host.phone.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      next = next.filter((host) => {
        const value = getFilterValueForKey(host, key);
        return selected.includes(value);
      });
    });

    if (sortCriteria.length > 0) {
      next = [...next].sort((left, right) => {
        for (const criterion of sortCriteria) {
          const { key, order } = criterion;
          const leftValue = normalizeText(String(left[key] ?? ''));
          const rightValue = normalizeText(String(right[key] ?? ''));
          const comparison = leftValue.localeCompare(rightValue, 'vi', {
            sensitivity: 'base'
          });

          if (comparison !== 0) {
            return order === 'asc' ? comparison : -comparison;
          }
        }

        return 0;
      });
    }

    return next;
  }, [
    columnValueFilters,
    getFilterValueForKey,
    hosts,
    searchQuery,
    sortCriteria
  ]);

  const totalPages = Math.max(1, hostListData?.page.totalPages ?? 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHosts = filteredHosts;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, columnValueFilters, sortCriteria]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusBadgeClassName = (status: HostStatus) =>
    status === 'Hoạt động'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : 'border-rose-200 bg-rose-50 text-rose-500';

  return (
    <DashboardLayout
      title="Quản lý Host"
      description="Quản lý người tổ chức hoạt động trong tổ chức"
      user={user}
      userDetails={userDetails}
      routes={routes}
      colorVariant={colorVariant}
      signInPath={signInPath}
    >
      <div className="w-full max-w-none">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <p className="text-sm text-zinc-500">
              Quản lý người phụ trách sự kiện
            </p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              router.push('/organizer/host-management/create-host')
            }
          >
            <Plus className="h-4 w-4" />
            Tạo Host mới
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo tên, địa chỉ, email hoặc số điện thoại..."
              className="bg-white border-zinc-200 pl-11 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200 bg-zinc-50 hover:bg-zinc-100">
                  <TableHead className="min-w-[240px] text-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>Tên host</span>
                      <ValueFilterDropdown columnKey="name" label="Tên host" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[220px] text-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>Địa chỉ</span>
                      <ValueFilterDropdown
                        columnKey="district"
                        label="Địa chỉ"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[220px] text-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>Email</span>
                      <ValueFilterDropdown columnKey="email" label="Email" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px] text-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <span>Số điện thoại</span>
                      <ValueFilterDropdown
                        columnKey="phone"
                        label="Số điện thoại"
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
                  <TableHead className="text-center text-zinc-700">
                    Sự kiện đã host
                  </TableHead>
                  <TableHead className="w-16 text-right text-zinc-700">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!mounted ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-zinc-500"
                    >
                      &nbsp;
                    </TableCell>
                  </TableRow>
                ) : isHostListLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-zinc-500"
                    >
                      Đang tải danh sách host...
                    </TableCell>
                  </TableRow>
                ) : hostListError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-rose-500"
                    >
                      Không thể tải danh sách host. Vui lòng thử lại.
                    </TableCell>
                  </TableRow>
                ) : paginatedHosts.length > 0 ? (
                  paginatedHosts.map((host) => {
                    const initials = host.name
                      .split(' ')
                      .slice(-2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <TableRow
                        key={host.id}
                        className="border-b border-zinc-200 transition-colors hover:bg-zinc-50"
                      >
                        <TableCell className="font-medium text-zinc-900">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-slate-200 shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-500 text-sm font-semibold text-white">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-zinc-900">
                                {host.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {host.district}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {host.email}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {host.phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-semibold',
                              statusBadgeClassName(host.status)
                            )}
                          >
                            <span
                              className={cn(
                                'mr-1.5 inline-block h-2 w-2 rounded-full',
                                host.status === 'Hoạt động'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-400'
                              )}
                            />
                            {host.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-zinc-600">
                          {host.eventCount}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border border-zinc-200 bg-white text-zinc-900 shadow-lg"
                            >
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  router.push(
                                    `/organizer/host-management/${host.id}`
                                  );
                                }}
                                className="cursor-pointer text-zinc-900 focus:bg-blue-100 focus:text-blue-800 data-[highlighted]:bg-blue-100 data-[highlighted]:text-blue-800"
                              >
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  setConfirmActionHost(host);
                                }}
                                className="cursor-pointer text-zinc-900 focus:bg-blue-50 focus:text-blue-800 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-800"
                              >
                                {host.status === 'Hoạt động'
                                  ? 'Khóa tài khoản'
                                  : 'Mở khóa tài khoản'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-zinc-500"
                    >
                      Không tìm thấy host phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Trang {safeCurrentPage} / {totalPages}
          </p>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 disabled:border-blue-100 disabled:bg-blue-50/40 disabled:text-blue-300"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Trước
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    page === safeCurrentPage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 disabled:border-blue-100 disabled:bg-blue-50/40 disabled:text-blue-300"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Tiếp
            </Button>
          </div>
        </div>

        <Dialog
          open={Boolean(confirmActionHost)}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmActionHost(null);
            }
          }}
        >
          <DialogContent className="border-zinc-200 bg-white sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                {confirmActionHost?.status === 'Hoạt động' ? (
                  <X className="h-8 w-8 text-red-600" />
                ) : (
                  <Check className="h-8 w-8 text-emerald-600" />
                )}
              </div>
              <DialogTitle>{confirmActionText}</DialogTitle>
              <DialogDescription className="text-zinc-500">
                {confirmActionHost?.status === 'Hoạt động' ? (
                  <>
                    Bạn có chắc chắn muốn khóa tài khoản của{' '}
                    <span className="font-semibold text-zinc-900">
                      {confirmActionHost?.name}
                    </span>
                    ? Host này sẽ bị chuyển sang trạng thái ngừng hoạt động.
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn mở khóa tài khoản của{' '}
                    <span className="font-semibold text-zinc-900">
                      {confirmActionHost?.name}
                    </span>
                    ? Host này sẽ được chuyển lại sang trạng thái hoạt động.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                onClick={() => setConfirmActionHost(null)}
              >
                Hủy
              </Button>
              <Button
                className={cn(
                  confirmActionHost?.status === 'Hoạt động'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                )}
                onClick={() => {
                  if (confirmActionHost) {
                    toggleHostStatus(confirmActionHost.id);
                  }
                  setConfirmActionHost(null);
                }}
              >
                {confirmActionText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
