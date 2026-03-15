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
import { useOrgRegistrationsList } from '@/hooks/features/uc040-approve-reject-organization/useOrgRegistrationsList';
import type { OrgRegistrationItem } from '@/hooks/entity';
import { cn } from '@/utils/cn';
import { ORG_TYPE_LABELS, EOrgType } from '@/constants/org-type';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const renderYesNo = (value: boolean | null) => {
  if (value === null || value === undefined) return '-';
  return value ? 'Có' : 'Không';
};

export default function PendingOrgs({ user, userDetails }: Props) {
  type OrgRow = OrgRegistrationItem;
  type SortKey =
    | 'id'
    | 'name'
    | 'orgType'
    | 'dhaRegistered'
    | 'managerFullName'
    | 'managerCid'
    | 'managerEmail'
    | 'status';
  type SortOrder = 'asc' | 'desc';
  type SortCriterion = { key: SortKey; order: SortOrder };
  type ValueFilterKey = Exclude<SortKey, 'id'>;

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data, error, isLoading } = useOrgRegistrationsList({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    status: 'PENDING',
    email: searchQuery,
    baseUrl: apiBaseUrl
  });

  const organizations = useMemo<OrgRegistrationItem[]>(() => {
    if (!data?.content) return [];
    return data.content.map((item) => ({
      id: item.id,
      name: item.name ?? null,
      dhaRegistered: item.dhaRegistered ?? null,
      orgType: item.orgType ?? null,
      managerFullName: item.managerFullName ?? null,
      managerCid: item.managerCid ?? null,
      managerEmail: item.managerEmail ?? null
    }));
  }, [data]);

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

  const getFilterValueForKey = (org: OrgRow, key: ValueFilterKey) => {
    switch (key) {
      case 'name':
        return normalizeForFilter(org.name);
      case 'orgType':
        return normalizeForFilter(org.orgType);
      case 'dhaRegistered':
        return normalizeForFilter(renderYesNo(org.dhaRegistered));
      case 'managerFullName':
        return normalizeForFilter(org.managerFullName);
      case 'managerCid':
        return normalizeForFilter(org.managerCid);
      case 'managerEmail':
        return normalizeForFilter(org.managerEmail);
      case 'status':
        return 'Chờ phê duyệt';
      default:
        return '-';
    }
  };

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const unique = new Set<string>();
    organizations.forEach((org) => unique.add(getFilterValueForKey(org, key)));
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
      [organizations]
    );
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;

    const isSearchFilteringThisColumn = Boolean(searchQuery.trim());
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

  const SortOnlyDropdown = (props: { sortKey: SortKey; label: string }) => {
    const { sortKey, label } = props;
    const isActive = sortCriteria.some((c) => c.key === sortKey);
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) && sortKey === 'id';
    const isApplied = isActive || isSearchFilteringThisColumn;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isApplied ? 'text-primary' : 'text-zinc-500'}`}
            aria-label={`Sắp xếp cột ${label}`}
          >
            {isApplied ? (
              <Funnel className="h-4 w-4" />
            ) : (
              <ListFilter className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[220px] p-1 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
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
          {isActive && (
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
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const totalPages = data?.page?.totalPages
    ? Math.max(1, data.page.totalPages)
    : Math.max(1, Math.ceil(organizations.length / pageSize));

  const displayOrgs = useMemo(() => {
    let result = organizations;

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      result = result.filter((org) => {
        const v = getFilterValueForKey(org, key);
        return selected.includes(v);
      });
    });

    if (sortCriteria.length > 0) {
      result = [...result].sort((a, b) => {
        for (const criterion of sortCriteria) {
          const { key, order } = criterion;
          const va = normalizeText(
            key === 'dhaRegistered'
              ? renderYesNo(a.dhaRegistered)
              : key === 'status'
                ? 'Chờ phê duyệt'
                : String((a as any)[key] ?? '')
          );
          const vb = normalizeText(
            key === 'dhaRegistered'
              ? renderYesNo(b.dhaRegistered)
              : key === 'status'
                ? 'Chờ phê duyệt'
                : String((b as any)[key] ?? '')
          );

          const cmp = va.localeCompare(vb, 'vi', { sensitivity: 'base' });
          if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, columnValueFilters, sortCriteria]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Tổ chức chờ phê duyệt"
      description="Danh sách các tổ chức đang chờ phê duyệt"
    >
      <div className="w-full max-w-none">
        <div className="mb-6"></div>

        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm email quản lý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50">
                <TableHead className="text-zinc-700 w-48">
                  <div className="flex items-center justify-between gap-2">
                    <span>ID</span>
                    <SortOnlyDropdown sortKey="id" label="ID" />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Tên tổ chức</span>
                    <ValueFilterDropdown columnKey="name" label="Tên tổ chức" />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Loại tổ chức</span>
                    <ValueFilterDropdown
                      columnKey="orgType"
                      label="Loại tổ chức"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Đăng ký với Sở Nội Vụ</span>
                    <ValueFilterDropdown
                      columnKey="dhaRegistered"
                      label="Đăng ký với Sở Nội Vụ"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Quản lý</span>
                    <ValueFilterDropdown
                      columnKey="managerFullName"
                      label="Quản lý"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>CCCD</span>
                    <ValueFilterDropdown columnKey="managerCid" label="CCCD" />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>Email</span>
                    <ValueFilterDropdown
                      columnKey="managerEmail"
                      label="Email"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-700 w-44">
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
                    colSpan={8}
                    className="py-8 text-center text-zinc-500"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-red-500"
                  >
                    Không thể tải dữ liệu. Vui lòng thử lại.
                  </TableCell>
                </TableRow>
              ) : displayOrgs.length > 0 ? (
                displayOrgs.map((org) => (
                  <TableRow
                    key={org.id}
                    className={cn(
                      'border-b border-zinc-200 cursor-pointer',
                      selectedOrgId === Number(org.id) ? 'bg-zinc-50' : '',
                      'hover:bg-zinc-50'
                    )}
                    onClick={() => {
                      setSelectedOrgId(Number(org.id));
                      router.push(`/dashboard/pending-orgs/${org.id}`);
                    }}
                  >
                    <TableCell
                      className="font-medium text-zinc-900 w-48 max-w-[12rem] truncate"
                      title={org.id}
                    >
                      {org.id}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {org.name || '-'}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {ORG_TYPE_LABELS[org.orgType as EOrgType] ||
                        org.orgType ||
                        '-'}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {renderYesNo(org.dhaRegistered)}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {org.managerFullName || '-'}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {org.managerCid || '-'}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {org.managerEmail || '-'}
                    </TableCell>
                    <TableCell className="align-middle w-44">
                      <Badge className="inline-block rounded-full bg-gray-500 text-white font-semibold px-3 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-400">
                        Chờ phê duyệt
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-zinc-500"
                  >
                    Không có tổ chức chờ phê duyệt
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
