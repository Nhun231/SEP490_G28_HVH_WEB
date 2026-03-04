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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  Eye,
  Filter as Funnel,
  ListFilter,
  Lock,
  Plus,
  Pencil,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

// Mock data for registered organizations
const mockRegisteredOrganizations = [
  { id: 1, name: 'Tổ chức A' },
  { id: 2, name: 'Tổ chức B' },
  { id: 3, name: 'Tổ chức C' },
  { id: 4, name: 'Tổ chức D' },
  { id: 5, name: 'Tổ chức E' },
  { id: 6, name: 'Tổ chức F' },
  { id: 7, name: 'Tổ chức G' },
  { id: 8, name: 'Tổ chức H' },
  { id: 9, name: 'Tổ chức I' },
  { id: 10, name: 'Tổ chức J' },
  { id: 11, name: 'Tổ chức K' },
  { id: 12, name: 'Tổ chức L' },
  { id: 13, name: 'Tổ chức M' },
  { id: 14, name: 'Tổ chức N' },
  { id: 15, name: 'Tổ chức O' }
];

// Mock data for demonstration
const mockOrganizers = [
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=21',
    orgName: 'Tổ chức A',
    fullName: 'Nguyễn Văn An',
    cccd: '011234567890',
    phone: '0912345678',
    email: 'organizer1@example.com',
    dob: '15/05/1985',
    events: 25,
    role: 'Manager',
    status: 'active'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=22',
    orgName: 'Tổ chức B',
    fullName: 'Trần Thị Bình',
    cccd: '011234567891',
    phone: '0987654321',
    email: 'organizer2@example.com',
    dob: '20/08/1987',
    events: 18,
    role: 'Host',
    status: 'active'
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=23',
    orgName: 'Tổ chức C',
    fullName: 'Lê Hoàng Cường',
    cccd: '011234567892',
    phone: '0901234567',
    email: 'organizer3@example.com',
    dob: '10/12/1984',
    events: 12,
    role: 'Manager',
    status: 'inactive'
  },
  {
    id: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=24',
    orgName: 'Tổ chức D',
    fullName: 'Phạm Thị Dung',
    cccd: '011234567893',
    phone: '0923456789',
    email: 'organizer4@example.com',
    dob: '25/03/1989',
    events: 30,
    role: 'Host',
    status: 'active'
  },
  {
    id: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=25',
    orgName: 'Tổ chức E',
    fullName: 'Hoàng Văn Em',
    cccd: '011234567894',
    phone: '0934567890',
    email: 'organizer5@example.com',
    dob: '05/07/1986',
    events: 8,
    role: 'Manager',
    status: 'locked'
  },
  {
    id: 6,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=26',
    orgName: 'Tổ chức F',
    fullName: 'Vũ Minh Phúc',
    cccd: '011234567895',
    phone: '0945678901',
    email: 'organizer6@example.com',
    dob: '12/11/1988',
    events: 22,
    role: 'Host',
    status: 'active'
  },
  {
    id: 7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=27',
    orgName: 'Tổ chức G',
    fullName: 'Đặng Thị Hạnh',
    cccd: '011234567896',
    phone: '0956789012',
    email: 'organizer7@example.com',
    dob: '09/02/1991',
    events: 15,
    role: 'Manager',
    status: 'active'
  },
  {
    id: 8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=28',
    orgName: 'Tổ chức H',
    fullName: 'Bùi Quốc Huy',
    cccd: '011234567897',
    phone: '0967890123',
    email: 'organizer8@example.com',
    dob: '22/09/1983',
    events: 10,
    role: 'Host',
    status: 'inactive'
  },
  {
    id: 9,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=29',
    orgName: 'Tổ chức I',
    fullName: 'Phan Thị Lan',
    cccd: '011234567898',
    phone: '0978901234',
    email: 'organizer9@example.com',
    dob: '18/01/1990',
    events: 28,
    role: 'Manager',
    status: 'active'
  },
  {
    id: 10,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=30',
    orgName: 'Tổ chức J',
    fullName: 'Đỗ Đức Long',
    cccd: '011234567899',
    phone: '0989012345',
    email: 'organizer10@example.com',
    dob: '03/06/1985',
    events: 20,
    role: 'Host',
    status: 'active'
  },
  {
    id: 11,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=31',
    orgName: 'Tổ chức K',
    fullName: 'Lý Thị Mai',
    cccd: '011234567900',
    phone: '0911122233',
    email: 'organizer11@example.com',
    dob: '30/10/1992',
    events: 6,
    role: 'Manager',
    status: 'inactive'
  },
  {
    id: 12,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=32',
    orgName: 'Tổ chức L',
    fullName: 'Ngô Quang Nam',
    cccd: '011234567901',
    phone: '0922233344',
    email: 'organizer12@example.com',
    dob: '14/04/1984',
    events: 35,
    role: 'Host',
    status: 'active'
  },
  {
    id: 13,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=33',
    orgName: 'Tổ chức M',
    fullName: 'Tạ Thị Quyên',
    cccd: '011234567902',
    phone: '0933344455',
    email: 'organizer13@example.com',
    dob: '27/08/1988',
    events: 16,
    role: 'Manager',
    status: 'active'
  },
  {
    id: 14,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=34',
    orgName: 'Tổ chức N',
    fullName: 'Trương Minh Khoa',
    cccd: '011234567903',
    phone: '0944455566',
    email: 'organizer14@example.com',
    dob: '16/12/1989',
    events: 9,
    role: 'Host',
    status: 'locked'
  },
  {
    id: 15,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=35',
    orgName: 'Tổ chức O',
    fullName: 'Nguyễn Thị Oanh',
    cccd: '011234567904',
    phone: '0955566677',
    email: 'organizer15@example.com',
    dob: '08/03/1987',
    events: 26,
    role: 'Manager',
    status: 'active'
  }
];

export default function OrganizersList(props: Props) {
  type Organizer = (typeof mockOrganizers)[0];
  type SortKey =
    | 'none'
    | 'id'
    | 'orgName'
    | 'fullName'
    | 'cccd'
    | 'phone'
    | 'email'
    | 'dob'
    | 'events'
    | 'role'
    | 'status';
  type ValueFilterKey =
    | 'orgName'
    | 'fullName'
    | 'cccd'
    | 'phone'
    | 'email'
    | 'role'
    | 'status';

  const [organizers, setOrganizers] = useState(mockOrganizers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Organizer | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLockUser, setSelectedLockUser] = useState<Organizer | null>(
    null
  );
  const [openLockModal, setOpenLockModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<Organizer | null>(
    null
  );
  const [editOrganizer, setEditOrganizer] = useState({
    orgName: '',
    fullName: '',
    cccd: '',
    phone: '',
    email: '',
    dob: ''
  });
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [dobFrom, setDobFrom] = useState('');
  const [dobTo, setDobTo] = useState('');
  const [sortField, setSortField] = useState<SortKey>('none');
  const [sortOrder, setSortOrder] = useState('desc');
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const [openAddHostModal, setOpenAddHostModal] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    typeof mockRegisteredOrganizations
  >([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [newHost, setNewHost] = useState({
    orgName: '',
    fullName: '',
    cccd: '',
    phone: '',
    email: '',
    password: '',
    dob: ''
  });
  const pageSize = 10;
  const formatDobForInput = (dob: string) => {
    if (!dob) return '';
    if (dob.includes('/')) {
      const [day, month, year] = dob.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dob;
  };

  const formatDobForDisplay = (dob: string) => {
    if (!dob) return '';
    if (dob.includes('-')) {
      const [year, month, day] = dob.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return dob;
  };

  const normalizeForFilter = (value: unknown) => String(value ?? '').trim();

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const getOrgNameForFilter = (org: Organizer) => {
    if (org.orgName) return normalizeForFilter(org.orgName);
    if (org.fullName.includes(' - ')) {
      return normalizeForFilter(org.fullName.split(' - ')[0].trim());
    }
    return normalizeForFilter(org.fullName);
  };

  const getPersonNameForFilter = (org: Organizer) => {
    if (org.fullName.includes(' - ')) {
      return normalizeForFilter(
        org.fullName.split(' - ').slice(1).join(' - ').trim()
      );
    }
    return normalizeForFilter(org.fullName);
  };

  const getFilterValueForKey = (org: Organizer, key: ValueFilterKey) => {
    switch (key) {
      case 'orgName':
        return getOrgNameForFilter(org);
      case 'fullName':
        return getPersonNameForFilter(org);
      case 'cccd':
        return normalizeForFilter(org.cccd);
      case 'phone':
        return normalizeForFilter(org.phone);
      case 'email':
        return normalizeForFilter(org.email).toLowerCase();
      case 'role':
        return normalizeForFilter(org.role);
      case 'status':
        return normalizeForFilter(org.status);
      default:
        return '';
    }
  };

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const values = organizers
      .map((o) => getFilterValueForKey(o, key))
      .filter(Boolean);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  };

  const ValueFilterDropdown = (props: {
    columnKey: ValueFilterKey;
    label: string;
  }) => {
    const { columnKey, label } = props;
    const values = useMemo(
      () => getUniqueValuesForKey(columnKey),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [organizers]
    );
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) &&
      ((searchField === 'name' && columnKey === 'fullName') ||
        (searchField === 'cccd' && columnKey === 'cccd') ||
        (searchField === 'phone' && columnKey === 'phone') ||
        (searchField === 'email' && columnKey === 'email'));
    const isSortActive = sortField === columnKey;
    const isApplied =
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
            className={`h-7 w-7 p-0 ${
              isApplied ? 'text-primary' : 'text-zinc-500'
            }`}
            aria-label={`Bộ lọc cột ${label}`}
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
          className="w-[320px] p-2 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortField(columnKey);
              setSortOrder('asc');
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp A đến Z
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortField(columnKey);
              setSortOrder('desc');
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Sắp xếp Z đến A
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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

  const DobFilterDropdown = () => {
    const [open, setOpen] = useState(false);
    const [localFrom, setLocalFrom] = useState(dobFrom);
    const [localTo, setLocalTo] = useState(dobTo);
    const hasActive = Boolean(dobFrom || dobTo);
    const isApplied = hasActive || sortField === 'dob';

    return (
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setLocalFrom(dobFrom);
            setLocalTo(dobTo);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${isApplied ? 'text-primary' : 'text-zinc-500'}`}
            aria-label="Bộ lọc cột Ngày sinh"
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
          className="w-[320px] p-2 bg-white text-zinc-900 border border-zinc-200 shadow-lg"
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortField('dob');
              setSortOrder('asc');
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortField('dob');
              setSortOrder('desc');
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Sắp xếp giảm dần
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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
                  setLocalFrom(dobFrom);
                  setLocalTo(dobTo);
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="h-9"
                onClick={() => {
                  setDobFrom(localFrom);
                  setDobTo(localTo);
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
                    setDobFrom('');
                    setDobTo('');
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
    const isActive = sortField === sortKey;
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) && sortKey === 'id' && searchField === 'id';
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
              setSortField(sortKey);
              setSortOrder('asc');
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortField(sortKey);
              setSortOrder('desc');
              setCurrentPage(1);
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
                  setSortField('none');
                  setCurrentPage(1);
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

  const filteredOrganizers = useMemo(() => {
    const parseDob = (dob: string) => {
      const [day, month, year] = dob.split('/').map(Number);
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

    const fromDate = dobFrom ? parseYmdStartOfDay(dobFrom) : null;
    const toDate = dobTo ? parseYmdEndOfDay(dobTo) : null;

    let result = organizers.filter((org) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      switch (searchField) {
        case 'id':
          return String(org.id).includes(query);
        case 'name':
          return org.fullName.toLowerCase().includes(query);
        case 'cccd':
          return org.cccd.includes(query);
        case 'phone':
          return org.phone.includes(query);
        case 'email':
          return org.email.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      result = result.filter((org) => {
        const v = getFilterValueForKey(org, key);
        return selected.includes(v);
      });
    });

    if (fromDate || toDate) {
      result = result.filter((org) => {
        const orgDate = parseDob(org.dob);
        if (fromDate && orgDate < fromDate) return false;
        if (toDate && orgDate > toDate) return false;
        return true;
      });
    }

    if (sortField !== 'none') {
      result = [...result].sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'id') return (a.id - b.id) * order;
        if (sortField === 'events') return (a.events - b.events) * order;
        if (sortField === 'dob')
          return (
            (parseDob(a.dob).getTime() - parseDob(b.dob).getTime()) * order
          );

        if (sortField === 'orgName')
          return (
            getOrgNameForFilter(a).localeCompare(getOrgNameForFilter(b)) * order
          );
        if (sortField === 'fullName')
          return (
            getPersonNameForFilter(a).localeCompare(getPersonNameForFilter(b)) *
            order
          );
        if (sortField === 'email')
          return a.email.localeCompare(b.email) * order;
        if (sortField === 'phone')
          return a.phone.localeCompare(b.phone) * order;
        if (sortField === 'cccd') return a.cccd.localeCompare(b.cccd) * order;
        if (sortField === 'role') return a.role.localeCompare(b.role) * order;
        if (sortField === 'status')
          return a.status.localeCompare(b.status) * order;

        return 0;
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    organizers,
    searchField,
    searchQuery,
    columnValueFilters,
    dobFrom,
    dobTo,
    sortField,
    sortOrder
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrganizers.length / pageSize)
  );
  const paginatedOrganizers = filteredOrganizers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleView = (orgId: number) => {
    const org = organizers.find((o) => o.id === orgId);
    if (org) {
      setSelectedUser(org);
      setOpenDetailModal(true);
    }
  };

  const handleLock = (orgId: number) => {
    const org = organizers.find((o) => o.id === orgId);
    if (org) {
      setSelectedLockUser(org);
      setOpenLockModal(true);
    }
  };

  const handleEdit = (orgId: number) => {
    const org = organizers.find((o) => o.id === orgId);
    if (!org) return;
    setSelectedEditUser(org);
    setEditOrganizer({
      orgName: org.orgName,
      fullName: org.fullName,
      cccd: org.cccd,
      phone: org.phone,
      email: org.email,
      dob: formatDobForInput(org.dob)
    });
    setOpenEditModal(true);
  };

  const handleConfirmLock = () => {
    if (!selectedLockUser) return;

    setOrganizers((prev) =>
      prev.map((org) =>
        org.id === selectedLockUser.id
          ? {
              ...org,
              status: org.status === 'locked' ? 'active' : 'locked'
            }
          : org
      )
    );
    setOpenLockModal(false);
  };

  const handleConfirmEdit = () => {
    if (!selectedEditUser) return;

    setOrganizers((prev) =>
      prev.map((org) =>
        org.id === selectedEditUser.id
          ? {
              ...org,
              orgName: editOrganizer.orgName,
              fullName: editOrganizer.fullName,
              cccd: editOrganizer.cccd,
              phone: editOrganizer.phone,
              email: editOrganizer.email,
              dob: formatDobForDisplay(editOrganizer.dob)
            }
          : org
      )
    );
    setOpenEditModal(false);
  };

  const handleOrgSearch = (query: string) => {
    setOrgSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOrganizations([]);
      setShowOrgDropdown(false);
    } else {
      const filtered = mockRegisteredOrganizations.filter((org) =>
        org.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrganizations(filtered);
      setShowOrgDropdown(filtered.length > 0);
    }
  };

  const handleSelectOrganization = (orgName: string) => {
    setNewHost({
      ...newHost,
      orgName
    });
    setOrgSearchQuery(orgName);
    setShowOrgDropdown(false);
  };

  const handleAddHost = () => {
    if (
      !newHost.fullName ||
      !newHost.cccd ||
      !newHost.phone ||
      !newHost.email ||
      !newHost.password ||
      !newHost.orgName
    ) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    const newOrganizerData = {
      id: Math.max(...organizers.map((o) => o.id)) + 1,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random() * 100}`,
      orgName: newHost.orgName,
      fullName: newHost.fullName,
      cccd: newHost.cccd,
      phone: newHost.phone,
      email: newHost.email,
      dob: newHost.dob || '01/01/2000',
      events: 0,
      role: 'Host',
      status: 'active'
    };

    setOrganizers((prev) => [...prev, newOrganizerData]);
    setNewHost({
      orgName: '',
      fullName: '',
      cccd: '',
      phone: '',
      email: '',
      password: '',
      dob: ''
    });
    setOrgSearchQuery('');
    setFilteredOrganizations([]);
    setShowOrgDropdown(false);
    setOpenAddHostModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">active</Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">inactive</Badge>
        );
      case 'locked':
        return <Badge className="bg-red-500 hover:bg-red-600">locked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Manager':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Manager</Badge>;
      case 'Host':
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Host</Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getOrgDisplayName = (org: (typeof mockOrganizers)[0]) => {
    if (org.orgName) return org.orgName;
    if (org.fullName.includes(' - ')) {
      return org.fullName.split(' - ')[0].trim();
    }
    return org.fullName;
  };

  const getPersonDisplayName = (org: (typeof mockOrganizers)[0]) => {
    if (org.fullName.includes(' - ')) {
      return org.fullName.split(' - ').slice(1).join(' - ').trim();
    }
    return org.fullName;
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Quản Lý Người Tổ Chức"
      description="Quản lý danh sách người tổ chức"
    >
      <div className="w-full">
        <div className="sticky top-0 z-20 -mx-1 mb-4 px-1 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1">
              <Select
                value={searchField}
                onValueChange={(value) => {
                  setSearchField(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] !bg-white !border-zinc-200 !text-zinc-900">
                  <SelectValue placeholder="Chọn tiêu chí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="cccd">CCCD</SelectItem>
                  <SelectItem value="phone">Số điện thoại</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Nhập từ khóa tìm kiếm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
            <Button
              onClick={() => setOpenAddHostModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1200px] bg-white">
              <TableHeader className="bg-white">
                <TableRow className="bg-white">
                  <TableHead className="w-[60px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>ID</span>
                      <SortOnlyDropdown sortKey="id" label="ID" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Avatar</span>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Tên tổ chức</span>
                      <ValueFilterDropdown
                        columnKey="orgName"
                        label="Tên tổ chức"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Họ và tên</span>
                      <ValueFilterDropdown
                        columnKey="fullName"
                        label="Họ và tên"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>CCCD</span>
                      <ValueFilterDropdown columnKey="cccd" label="CCCD" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Số điện thoại</span>
                      <ValueFilterDropdown
                        columnKey="phone"
                        label="Số điện thoại"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Email</span>
                      <ValueFilterDropdown columnKey="email" label="Email" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Ngày sinh</span>
                      <DobFilterDropdown />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] text-center whitespace-nowrap">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-full text-center">Số sự kiện</span>
                      <SortOnlyDropdown sortKey="events" label="Số sự kiện" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Vai trò</span>
                      <ValueFilterDropdown columnKey="role" label="Vai trò" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[110px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Trạng thái</span>
                      <ValueFilterDropdown
                        columnKey="status"
                        label="Trạng thái"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizers.map((org) => (
                  <TableRow key={org.id} className="hover:bg-zinc-50">
                    <TableCell className="font-medium">{org.id}</TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={org.avatar}
                          alt={getPersonDisplayName(org)}
                        />
                        <AvatarFallback>
                          {getPersonDisplayName(org).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getOrgDisplayName(org)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getPersonDisplayName(org)}
                    </TableCell>
                    <TableCell>{org.cccd}</TableCell>
                    <TableCell>{org.phone}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.dob}</TableCell>
                    <TableCell className="text-center">{org.events}</TableCell>
                    <TableCell>{getRoleBadge(org.role)}</TableCell>
                    <TableCell>{getStatusBadge(org.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleView(org.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(org.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleLock(org.id)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
        {/* Detail Modal */}
        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-white">
                Chi tiết thông tin người tổ chức
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về người tổ chức được chọn
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={selectedUser.avatar}
                      alt={getPersonDisplayName(selectedUser)}
                    />
                    <AvatarFallback>
                      {getPersonDisplayName(selectedUser).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {getPersonDisplayName(selectedUser)}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      ID: {selectedUser.id}
                    </p>
                    <div className="mt-3">
                      <Badge
                        variant={
                          selectedUser.status === 'active'
                            ? 'default'
                            : selectedUser.status === 'locked'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {selectedUser.status === 'active'
                          ? 'Hoạt động'
                          : selectedUser.status === 'locked'
                            ? 'Bị khóa'
                            : 'Không hoạt động'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact and Personal Details */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      CCCD
                    </p>
                    <p className="text-sm font-medium">{selectedUser.cccd}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Vai trò
                    </p>
                    <div className="mt-1">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Số điện thoại
                    </p>
                    <p className="text-sm font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Email
                    </p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Ngày sinh
                    </p>
                    <p className="text-sm font-medium">{selectedUser.dob}</p>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Sự kiện
                    </p>
                    <p className="text-2xl font-bold">{selectedUser.events}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Edit Organizer Modal */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-white">
                Cập nhật thông tin người tổ chức
              </DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin cơ bản của người tổ chức
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tên tổ chức
                </label>
                <Input
                  placeholder="Nhập tên tổ chức"
                  value={editOrganizer.orgName}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      orgName: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Họ và tên
                </label>
                <Input
                  placeholder="Nhập họ và tên đầy đủ"
                  value={editOrganizer.fullName}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      fullName: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Số CCCD
                  </label>
                  <Input
                    placeholder="Nhập 12 số CCCD"
                    value={editOrganizer.cccd}
                    onChange={(e) =>
                      setEditOrganizer({
                        ...editOrganizer,
                        cccd: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Số điện thoại
                  </label>
                  <Input
                    placeholder="Nhập số điện thoại"
                    value={editOrganizer.phone}
                    onChange={(e) =>
                      setEditOrganizer({
                        ...editOrganizer,
                        phone: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={editOrganizer.email}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      email: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={editOrganizer.dob}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      dob: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setOpenEditModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Cập nhật
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Lock Confirmation Modal */}
        <Dialog open={openLockModal} onOpenChange={setOpenLockModal}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-white">
                Xác nhận thay đổi trạng thái
              </DialogTitle>
              <DialogDescription>
                <span className="text-red-600">
                  {selectedLockUser
                    ? `Bạn có chắc muốn ${
                        selectedLockUser.status === 'locked'
                          ? 'mở khóa'
                          : 'khóa'
                      } tài khoản này không?`
                    : 'Bạn có chắc muốn thay đổi trạng thái tài khoản này không?'}
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedLockUser && (
              <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                <p className="font-semibold">{selectedLockUser.fullName}</p>
                <p>ID: {selectedLockUser.id}</p>
                <p>Email: {selectedLockUser.email}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setOpenLockModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmLock}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Xác nhận
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Add Host Modal */}
        <Dialog open={openAddHostModal} onOpenChange={setOpenAddHostModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-white">
                Tạo tài khoản Host mới
              </DialogTitle>
              <DialogDescription>Nhập thông tin Host</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Organization Information Section */}
              <div>
                <h3 className="font-semibold text-sm text-red-600 dark:text-zinc-300 mb-3">
                  Thông tin bắt buộc
                </h3>
                <div className="relative">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tên tổ chức <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập hoặc tìm kiếm tên tổ chức"
                    value={orgSearchQuery}
                    onChange={(e) => handleOrgSearch(e.target.value)}
                    onFocus={() => {
                      if (orgSearchQuery.trim() !== '') {
                        setShowOrgDropdown(true);
                      }
                    }}
                    className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                  />
                  {showOrgDropdown && filteredOrganizations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredOrganizations.map((org) => (
                        <button
                          key={org.id}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
                          onClick={() => handleSelectOrganization(org.name)}
                        >
                          {org.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information Section */}
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nhập họ và tên đầy đủ"
                      value={newHost.fullName}
                      onChange={(e) =>
                        setNewHost({
                          ...newHost,
                          fullName: e.target.value
                        })
                      }
                      className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số CCCD <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập 12 số CCCD"
                        value={newHost.cccd}
                        onChange={(e) =>
                          setNewHost({
                            ...newHost,
                            cccd: e.target.value
                          })
                        }
                        className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập số điện thoại"
                        value={newHost.phone}
                        onChange={(e) =>
                          setNewHost({
                            ...newHost,
                            phone: e.target.value
                          })
                        }
                        className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      value={newHost.email}
                      onChange={(e) =>
                        setNewHost({
                          ...newHost,
                          email: e.target.value
                        })
                      }
                      className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={newHost.password}
                      onChange={(e) =>
                        setNewHost({
                          ...newHost,
                          password: e.target.value
                        })
                      }
                      className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Information Section */}
              <div>
                <h3 className="font-semibold text-sm text-yellow-600 dark:text-zinc-400 mb-3">
                  Thông tin không bắt buộc
                </h3>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    value={newHost.dob}
                    onChange={(e) =>
                      setNewHost({
                        ...newHost,
                        dob: e.target.value
                      })
                    }
                    className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setOpenAddHostModal(false);
                  setNewHost({
                    orgName: '',
                    fullName: '',
                    cccd: '',
                    phone: '',
                    email: '',
                    password: '',
                    dob: ''
                  });
                  setOrgSearchQuery('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddHost}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tạo tài khoản
              </Button>
            </div>
          </DialogContent>
        </Dialog>{' '}
      </div>
    </DashboardLayout>
  );
}
