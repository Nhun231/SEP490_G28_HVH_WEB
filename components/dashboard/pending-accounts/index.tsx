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
import { usePendingAccounts } from '@/hooks/features/uc044-identity-verification/usePendingAccountsList';
import { ACCOUNT_STATUS } from '@/constants/account-status';
import type { PendingAccountItem } from '@/hooks/entity';
import { cn } from '@/utils/cn';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  accounts: PendingAccountItem[];
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export default function PendingAccounts({ user, userDetails }: Props) {
  type AccountRow = PendingAccountItem;
  type SortKey = 'id' | 'email' | 'cid' | 'role' | 'createdAt' | 'status';
  type SortOrder = 'asc' | 'desc';
  type SortCriterion = { key: SortKey; order: SortOrder };
  type ValueFilterKey = Exclude<SortKey, 'id' | 'createdAt'>;

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [createdDateFrom, setCreatedDateFrom] = useState('');
  const [createdDateTo, setCreatedDateTo] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = usePendingAccounts({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    status: ACCOUNT_STATUS.PENDING,
    email: searchQuery,
    baseUrl: apiBaseUrl
  });

  const effectiveAccounts = useMemo<PendingAccountItem[]>(() => {
    if (!data?.content) return [];
    return data.content.map((item) => ({
      id: item.id,
      email: item.email ?? null,
      phone: null,
      cid: item.cid ?? null,
      status: item.status ?? null,
      createdAt: item.createdAt ?? null
    }));
  }, [data]);

  const filteredAccounts = useMemo(() => {
    return effectiveAccounts.filter(
      (account) => account.status === ACCOUNT_STATUS.PENDING
    );
  }, [effectiveAccounts]);

  const totalPages = data?.page?.totalPages
    ? Math.max(1, data.page.totalPages)
    : 1;

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

  const normalizeForFilter = (value: unknown) => {
    const text = String(value ?? '').trim();
    return text ? text : '-';
  };

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const parseYmdStartOfDay = (ymd: string) => {
    const [year, month, day] = ymd.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const parseYmdEndOfDay = (ymd: string) => {
    const [year, month, day] = ymd.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  };

  const getRoleLabel = () => 'Tình nguyện viên';

  const getFilterValueForKey = (account: AccountRow, key: ValueFilterKey) => {
    switch (key) {
      case 'email':
        return normalizeForFilter(account.email).toLowerCase();
      case 'cid':
        return normalizeForFilter(account.cid);
      case 'role':
        return getRoleLabel();
      case 'status':
        return 'Chờ phê duyệt';
      default:
        return '-';
    }
  };

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const unique = new Set<string>();
    filteredAccounts.forEach((account) =>
      unique.add(getFilterValueForKey(account, key))
    );
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
      [filteredAccounts]
    );
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;

    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) && columnKey === 'email';
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

  const CreatedAtFilterDropdown = () => {
    const [open, setOpen] = useState(false);
    const [localFrom, setLocalFrom] = useState(createdDateFrom);
    const [localTo, setLocalTo] = useState(createdDateTo);
    const hasActive = Boolean(createdDateFrom || createdDateTo);
    const isSortActive = sortCriteria.some((c) => c.key === 'createdAt');
    const isActive = hasActive || isSortActive;

    return (
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setLocalFrom(createdDateFrom);
            setLocalTo(createdDateTo);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
            aria-label="Bộ lọc cột Ngày nộp"
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
              setSortForKey('createdAt', 'asc');
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey('createdAt', 'desc');
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
                  clearSortForKey('createdAt');
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
                  setLocalFrom(createdDateFrom);
                  setLocalTo(createdDateTo);
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="h-9"
                onClick={() => {
                  setCreatedDateFrom(localFrom);
                  setCreatedDateTo(localTo);
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
                    setCreatedDateFrom('');
                    setCreatedDateTo('');
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

  const SortOnlyDropdown = (props: { sortKey: SortKey; label: string }) => {
    const { sortKey, label } = props;
    const isActive = sortCriteria.some((c) => c.key === sortKey);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
            aria-label={`Sắp xếp cột ${label}`}
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
          className="w-[220px] p-2 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
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
          {isActive ? (
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
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const displayAccounts = useMemo(() => {
    let result = filteredAccounts;

    const from = createdDateFrom ? parseYmdStartOfDay(createdDateFrom) : null;
    const to = createdDateTo ? parseYmdEndOfDay(createdDateTo) : null;

    if (from || to) {
      result = result.filter((account) => {
        if (!account.createdAt) return false;
        const dt = new Date(account.createdAt);
        if (Number.isNaN(dt.getTime())) return false;
        if (from && dt < from) return false;
        if (to && dt > to) return false;
        return true;
      });
    }

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      result = result.filter((account) =>
        selected.includes(getFilterValueForKey(account, key))
      );
    });

    if (sortCriteria.length > 0) {
      result = [...result].sort((a, b) => {
        for (const criterion of sortCriteria) {
          const order = criterion.order === 'asc' ? 1 : -1;
          const key = criterion.key;

          if (key === 'createdAt') {
            const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (at !== bt) return (at - bt) * order;
            continue;
          }

          const aVal =
            key === 'role'
              ? getRoleLabel()
              : key === 'status'
                ? 'Chờ phê duyệt'
                : normalizeForFilter((a as any)[key]);
          const bVal =
            key === 'role'
              ? getRoleLabel()
              : key === 'status'
                ? 'Chờ phê duyệt'
                : normalizeForFilter((b as any)[key]);

          const cmp = String(aVal).localeCompare(String(bVal), 'vi', {
            sensitivity: 'base'
          });
          if (cmp !== 0) return cmp * order;
        }
        return 0;
      });
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredAccounts,
    createdDateFrom,
    createdDateTo,
    columnValueFilters,
    sortCriteria
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Tài khoản chờ phê duyệt"
      description="Danh sách các tài khoản đang chờ phê duyệt"
    >
      <div className="w-full max-w-none">
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50">
                <TableHead className="w-52 text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>ID</span>
                    <SortOnlyDropdown sortKey="id" label="ID" />
                  </div>
                </TableHead>
                <TableHead className="w-72 text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Email</span>
                    <ValueFilterDropdown columnKey="email" label="Email" />
                  </div>
                </TableHead>
                <TableHead className="w-44 text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Số CCCD</span>
                    <ValueFilterDropdown columnKey="cid" label="Số CCCD" />
                  </div>
                </TableHead>
                <TableHead className="w-44 text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Vai trò</span>
                    <ValueFilterDropdown columnKey="role" label="Vai trò" />
                  </div>
                </TableHead>
                <TableHead className="w-40 text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Ngày nộp</span>
                    <CreatedAtFilterDropdown />
                  </div>
                </TableHead>
                <TableHead className="w-44 text-zinc-700">
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-zinc-500"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-red-500"
                  >
                    Không thể tải dữ liệu. Vui lòng thử lại.
                  </TableCell>
                </TableRow>
              ) : displayAccounts.length > 0 ? (
                displayAccounts.map((account) => (
                  <TableRow
                    key={account.id}
                    className={cn(
                      'border-b border-zinc-200 cursor-pointer',
                      selectedAccountId === account.id ? 'bg-zinc-50' : '',
                      'hover:bg-zinc-50'
                    )}
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      router.push(`/dashboard/pending-accounts/${account.id}`);
                    }}
                  >
                    <TableCell
                      className="w-52 max-w-[12rem] truncate font-medium text-zinc-900"
                      title={account.id}
                    >
                      {account.id}
                    </TableCell>
                    <TableCell
                      className="w-72 max-w-[18rem] truncate text-zinc-600"
                      title={account.email || ''}
                    >
                      {account.email || '-'}
                    </TableCell>
                    <TableCell className="w-44 text-zinc-600">
                      {account.cid || '-'}
                    </TableCell>
                    <TableCell className="w-44 text-zinc-600">
                      {getRoleLabel()}
                    </TableCell>
                    <TableCell className="w-40 text-zinc-600">
                      {formatDate(account.createdAt)}
                    </TableCell>
                    <TableCell className="w-44 align-middle">
                      <Badge className="inline-block rounded-full bg-gray-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-600">
                        Chờ phê duyệt
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-zinc-500"
                  >
                    Không có tài khoản chờ phê duyệt
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
