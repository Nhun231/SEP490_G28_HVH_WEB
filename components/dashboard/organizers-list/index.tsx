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
  Building2,
  CalendarDays,
  Eye,
  Filter as Funnel,
  ListFilter,
  Lock,
  Mail,
  Plus,
  Pencil,
  Phone,
  ChevronRight,
  Users,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { EEventStatus, EVENT_STATUS_LABELS } from '@/constants/event-status';
import { getBadgeClassNameByStatus } from '@/constants/event-badge-status';
import type {
  HostActivitiesResponseForSystemAdmin,
  HostSimpleResponseForSystemAdmin
} from '@/hooks/dto';
import { useGetHostsofOrgsbySysAdmin } from '@/hooks/features/sys-admin/uc033-view-org-member-accounts-list/useGetHostsofOrgsbySysAdmin';
import { useGetHostActivitesbySysAdmin } from '@/hooks/features/sys-admin/uc034-view-organization-member-account-profile/useGetHostActivitesbySysAdmin';
import { useGetHostInfobySysAdmin } from '@/hooks/features/sys-admin/uc034-view-organization-member-account-profile/useGetHostInfobySysAdmin';
import { useUpdateHostProfile } from '@/hooks/features/sys-admin/uc036-update-organization-member-account-profile/useUpdateHostProfile';
import { useUploadFiles } from '@/hooks/features/commons/bucket/useUploadFiles';
import { toast } from 'sonner';
import { getFullSupabaseImageUrl } from '@/utils/helpers';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

type OrganizerStatus = 'active' | 'inactive' | 'locked';

type Organizer = Omit<
  HostSimpleResponseForSystemAdmin,
  'id' | 'fullName' | 'address' | 'email' | 'phone' | 'status'
> & {
  id: number;
  avatar: string;
  orgName: string;
  fullName: string;
  cccd: string;
  phone: string;
  email: string;
  dob: string;
  events: number;
  role: string;
  status: OrganizerStatus;
};

type RegisteredOrganization = {
  id: number;
  name: string;
};

const pageSize = 10;

const mapApiStatusToOrganizerStatus = (
  status: HostSimpleResponseForSystemAdmin['status']
): OrganizerStatus => {
  const normalized = String(status ?? '')
    .trim()
    .toUpperCase();
  if (normalized === 'ACTIVE' || normalized === 'APPROVED') return 'active';
  if (normalized === 'LOCKED' || normalized === 'REJECTED') return 'locked';
  return 'inactive';
};

const mapHostToOrganizer = (
  item: HostSimpleResponseForSystemAdmin,
  index: number
): Organizer => {
  const numericId = Number(item.id);
  const resolvedId = Number.isFinite(numericId) ? numericId : index + 1;
  const status = mapApiStatusToOrganizerStatus(item.status);

  return {
    id: resolvedId,
    avatarUrl: item.avatarUrl,
    avatar:
      getFullSupabaseImageUrl(item.avatarUrl) ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.id || String(resolvedId))}`,
    orgName: item.address?.trim() || 'Chưa cập nhật',
    fullName: item.fullName?.trim() || 'Chưa cập nhật',
    cccd: item.id,
    phone: item.phone?.trim() || '-',
    email: item.email?.trim() || '-',
    dob: '-',
    hostedEventCount: item.hostedEventCount,
    events: item.hostedEventCount ?? 0,
    role: 'Host',
    status
  };
};

export default function OrganizersList(props: Props) {
  type SortKey =
    | 'none'
    | 'id'
    | 'orgName'
    | 'fullName'
    | 'cccd'
    | 'phone'
    | 'email'
    | 'events'
    | 'status';
  type ValueFilterKey =
    | 'orgName'
    | 'fullName'
    | 'cccd'
    | 'phone'
    | 'email'
    | 'status';

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const router = useRouter();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Organizer | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string | undefined>();
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
    fullName: '',
    cccd: '',
    phone: '',
    email: '',
    dob: '',
    gender: true,
    address: '',
    detailAddress: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingOrganizer, setIsSavingOrganizer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const [editHostUuid, setEditHostUuid] = useState<string | null>(null);
  const [isLoadingEditDetails, setIsLoadingEditDetails] = useState(false);
  const [tempHostIdForEdit, setTempHostIdForEdit] = useState<string | undefined>(undefined);
  
  const { data: editHostDetailsData } = useGetHostInfobySysAdmin({
    id: tempHostIdForEdit,
    baseUrl,
    enabled: Boolean(tempHostIdForEdit)
  });
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortKey>('none');
  const [sortOrder, setSortOrder] = useState('desc');
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const [openAddHostModal, setOpenAddHostModal] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    RegisteredOrganization[]
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

  const { data: hostListData } = useGetHostsofOrgsbySysAdmin({
    pageNumber: Math.max(0, currentPage - 1),
    pageSize,
    baseUrl,
    enabled: true
  });

  const { data: hostDetailData, isLoading: isHostDetailLoading } =
    useGetHostInfobySysAdmin({
      id: selectedHostId,
      baseUrl,
      enabled: openDetailModal && Boolean(selectedHostId)
    });

  const { data: hostActivitiesData, isLoading: isHostActivitiesLoading } =
    useGetHostActivitesbySysAdmin({
      hostId: selectedHostId,
      pageNumber: 0,
      pageSize,
      baseUrl,
      enabled: openDetailModal && Boolean(selectedHostId)
    });

  useEffect(() => {
    const content = hostListData?.content ?? [];
    setOrganizers(
      content.map((item, index) => mapHostToOrganizer(item, index))
    );
  }, [hostListData?.content]);

  // Populate edit form when host details are loaded
  useEffect(() => {
    if (editHostDetailsData && tempHostIdForEdit) {
      setEditHostUuid(editHostDetailsData.id);
      setEditOrganizer({
        fullName: editHostDetailsData.fullName?.trim() || 'Chưa cập nhật',
        cccd: editHostDetailsData.cid || '-',
        phone: editHostDetailsData.phone?.trim() || '-',
        email: editHostDetailsData.email?.trim() || '-',
        dob: editHostDetailsData.dob || '',
        gender: editHostDetailsData.gender ?? true,
        address: editHostDetailsData.address?.trim() || '',
        detailAddress: editHostDetailsData.detailAddress?.trim() || ''
      });
      setAvatarPreview(
        getFullSupabaseImageUrl(editHostDetailsData.avatarUrl) ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(editHostDetailsData.id || '')}`
      );
      setIsLoadingEditDetails(false);
      setTempHostIdForEdit(undefined); // Reset to prevent re-triggering
    }
  }, [editHostDetailsData, tempHostIdForEdit]);

  const availableOrganizations = useMemo<RegisteredOrganization[]>(() => {
    const uniqueNames = Array.from(
      new Set(
        organizers
          .map((organizer) => organizer.orgName.trim())
          .filter((name) => name !== '' && name !== 'Chưa cập nhật')
      )
    );

    return uniqueNames.map((name, index) => ({
      id: index + 1,
      name
    }));
  }, [organizers]);

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
    return normalizeForFilter(org.orgName);
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
        (searchField === 'id' && columnKey === 'cccd') ||
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

  const SortOnlyDropdown = (props: { sortKey: SortKey; label: string }) => {
    const { sortKey, label } = props;
    const isActive = sortField === sortKey;
    const isSearchFilteringThisColumn = false;
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
    let result = organizers.filter((org) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      switch (searchField) {
        case 'id':
          return org.cccd.toLowerCase().includes(query);
        case 'name':
          return org.fullName.toLowerCase().includes(query);
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

    if (sortField !== 'none') {
      result = [...result].sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'id') return a.cccd.localeCompare(b.cccd) * order;
        if (sortField === 'events') return (a.events - b.events) * order;

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
    sortField,
    sortOrder
  ]);

  const handleView = (orgId: number) => {
    const org = organizers.find((o) => o.id === orgId);
    if (org) {
      setSelectedUser(org);
      setSelectedHostId(org.cccd);
      setActivitySearchQuery('');
      setActivityStatusFilter('all');
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

  const { uploadFileToSignedUrl } = useUploadFiles();

  const { trigger: updateHostProfile } = useUpdateHostProfile({
    hostId: editHostUuid ?? '',
    baseUrl
  });

  const handleEdit = (orgId: number) => {
    const org = organizers.find((o) => o.id === orgId);
    if (!org) return;
    
    setIsLoadingEditDetails(true);
    setSelectedEditUser(org);
    setTempHostIdForEdit(org.cccd); // This will trigger the hook to fetch data
    
    // Set temporary fallback data while loading
    setEditOrganizer({
      fullName: org.fullName,
      cccd: '-',
      phone: org.phone,
      email: org.email,
      dob: '',
      gender: true,
      address: org.orgName || '',
      detailAddress: ''
    });
    setAvatarPreview(org.avatar);
    setAvatarFile(null);
    setOpenEditModal(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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

  const handleConfirmEdit = async () => {
    if (!selectedEditUser) return;

    const newErrors: Record<string, string> = {};
    const requiredFieldLabels: Record<string, string> = {
      fullName: 'Họ và tên',
      dob: 'Ngày sinh',
      address: 'Địa chỉ',
      detailAddress: 'Địa chỉ chi tiết'
    };

    if (!editOrganizer.fullName.trim())
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!editOrganizer.dob.trim())
      newErrors.dob = 'Vui lòng nhập ngày sinh';
    if (!editOrganizer.address.trim())
      newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!editOrganizer.detailAddress.trim())
      newErrors.detailAddress = 'Vui lòng nhập địa chỉ chi tiết';

    if (Object.keys(newErrors).length > 0) {
      const missingFields = Object.keys(newErrors).map(
        (key) => requiredFieldLabels[key] || key
      );
      toast.error(
        `Vui lòng điền các thông tin bắt buộc: ${missingFields.join(', ')}`
      );
      return;
    }

    // Helper to filter placeholder values - return null for placeholders
    const filterPlaceholder = (value: string): string | null => {
      const trimmed = value.trim();
      if (trimmed === '-' || trimmed === 'Chưa cập nhật' || trimmed === '') return null;
      return trimmed;
    };

    const requestData: any = {
      fullName: filterPlaceholder(editOrganizer.fullName),
      cid: filterPlaceholder(editOrganizer.cccd),
      phone: filterPlaceholder(editOrganizer.phone),
      email: filterPlaceholder(editOrganizer.email),
      gender: editOrganizer.gender,
      dob: editOrganizer.dob || null,
      address: filterPlaceholder(editOrganizer.address),
      detailAddress: filterPlaceholder(editOrganizer.detailAddress)
    };

    if (avatarFile) {
      const avatarExtension = avatarFile.name.split('.').pop();
      requestData.avatarExtension = avatarExtension ? `.${avatarExtension}` : '';
    }

    try {
      setIsSavingOrganizer(true);
      const response = await updateHostProfile(requestData);

      if (avatarFile && response?.avatarUploadUrl) {
        const uploadUrl = response.avatarUploadUrl.startsWith('http')
          ? response.avatarUploadUrl
          : `${SUPABASE_URL?.replace(/\/$/, '')}${response.avatarUploadUrl}`;
        const uploadResult = await uploadFileToSignedUrl(avatarFile, uploadUrl);
        if (!uploadResult?.success) {
          throw new Error(uploadResult?.error || 'Không thể upload avatar');
        }
      }

      toast.success('Cập nhật thông tin người tổ chức thành công!');

      // Update local state
      setOrganizers((prev) =>
        prev.map((org) =>
          org.id === selectedEditUser.id
            ? {
                ...org,
                fullName: editOrganizer.fullName,
                avatar: avatarPreview || org.avatar
              }
            : org
        )
      );

      setOpenEditModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thông tin người tổ chức');
    } finally {
      setIsSavingOrganizer(false);
    }
  };

  const handleOrgSearch = (query: string) => {
    setOrgSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOrganizations([]);
      setShowOrgDropdown(false);
    } else {
      const filtered = availableOrganizations.filter((org) =>
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

    const newOrganizerData: Organizer = {
      id: Math.max(...organizers.map((o) => o.id), 0) + 1,
      avatarUrl: null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random() * 100}`,
      orgName: newHost.orgName,
      fullName: newHost.fullName,
      cccd: newHost.cccd,
      phone: newHost.phone,
      email: newHost.email,
      dob: newHost.dob || '01/01/2000',
      hostedEventCount: 0,
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

  const totalPages = Math.max(1, hostListData?.page.totalPages ?? 1);
  const paginatedOrganizers = filteredOrganizers;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 hover:text-white">
            Kích hoạt
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-500 hover:text-white">
            Không kích hoạt
          </Badge>
        );
      case 'locked':
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-500 hover:text-white">
            Đã khóa
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-500 hover:text-white">
            {status}
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Manager':
        return <Badge className="rounded-full bg-blue-500 text-[10px] px-1.5 py-0">Manager</Badge>;
      case 'Host':
        return (
          <Badge className="rounded-full bg-purple-500 text-[10px] px-1.5 py-0">Host</Badge>
        );
      default:
        return <Badge className="rounded-full text-[10px] px-1.5 py-0">{role}</Badge>;
    }
  };

  const getOrgDisplayName = (org: Organizer) => {
    if (org.orgName) return org.orgName;
    if (org.fullName.includes(' - ')) {
      return org.fullName.split(' - ')[0].trim();
    }
    return org.fullName;
  };

  const getPersonDisplayName = (org: Organizer) => {
    if (org.fullName.includes(' - ')) {
      return org.fullName.split(' - ').slice(1).join(' - ').trim();
    }
    return org.fullName;
  };

  const getCompactId = (id: string) => {
    const value = (id || '').trim();
    if (!value) return '-';
    if (value.length <= 13) return value;
    return `${value.slice(0, 8)}...${value.slice(-4)}`;
  };

  const detailFullName =
    hostDetailData?.fullName?.trim() ||
    selectedUser?.fullName ||
    'Chua cap nhat';
  const detailAvatar =
    getFullSupabaseImageUrl(hostDetailData?.avatarUrl) || selectedUser?.avatar || '';
  const detailId = hostDetailData?.id || selectedUser?.cccd || '-';
  const detailCid = hostDetailData?.cid?.trim() || '-';
  const detailAddress =
    hostDetailData?.address?.trim() || selectedUser?.orgName || '-';
  const detailDetailAddress = hostDetailData?.detailAddress?.trim() || '-';
  const detailEmail =
    hostDetailData?.email?.trim() || selectedUser?.email || '-';
  const detailPhone =
    hostDetailData?.phone?.trim() || selectedUser?.phone || '-';
  const detailGender =
    hostDetailData?.gender === null || hostDetailData?.gender === undefined
      ? 'Chua cap nhat'
      : hostDetailData.gender
        ? 'Nam'
        : 'Nu';
  const detailDob = hostDetailData?.dob
    ? formatDobForDisplay(hostDetailData.dob)
    : 'Chua cap nhat';
  const detailCreatedAt = hostDetailData?.createdAt
    ? new Date(hostDetailData.createdAt).toLocaleString('vi-VN')
    : 'Chua cap nhat';

  const formatDateTimeVi = (value: string | null | undefined) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN');
  };

  const hostActivities = useMemo<HostActivitiesResponseForSystemAdmin[]>(
    () => hostActivitiesData?.content ?? [],
    [hostActivitiesData?.content]
  );

  const filteredHostActivities = useMemo(() => {
    const normalizedQuery = normalizeText(activitySearchQuery || '');

    return hostActivities.filter((activity) => {
      const eventName = activity.eventName?.trim() || '';
      const normalizedEventName = normalizeText(eventName);
      const isMatchingQuery =
        !normalizedQuery || normalizedEventName.includes(normalizedQuery);

      const eventStatus = String(activity.eventStatus || '').trim();
      const isMatchingStatus =
        activityStatusFilter === 'all' || eventStatus === activityStatusFilter;

      return isMatchingQuery && isMatchingStatus;
    });
  }, [activitySearchQuery, activityStatusFilter, hostActivities]);

  const availableActivityStatuses = useMemo(() => {
    return Array.from(
      new Set(
        hostActivities
          .map((activity) => String(activity.eventStatus || '').trim())
          .filter(Boolean)
      )
    );
  }, [hostActivities]);

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
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="id">ID</SelectItem>
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
            <Table className="min-w-[1000px] bg-white text-sm">
              <TableHeader className="bg-white">
                <TableRow className="bg-white">
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>CCCD</span>
                      <SortOnlyDropdown sortKey="id" label="CCCD" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[60px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Avatar</span>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Họ và tên</span>
                      <ValueFilterDropdown
                        columnKey="fullName"
                        label="Họ và tên"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Địa chỉ</span>
                      <ValueFilterDropdown
                        columnKey="orgName"
                        label="Địa chỉ"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Số điện thoại</span>
                      <ValueFilterDropdown
                        columnKey="phone"
                        label="Số điện thoại"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Email</span>
                      <ValueFilterDropdown columnKey="email" label="Email" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] text-center whitespace-nowrap">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-full text-center">Sự kiện</span>
                      <SortOnlyDropdown sortKey="events" label="Số sự kiện" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[220px]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Trạng thái</span>
                      <ValueFilterDropdown
                        columnKey="status"
                        label="Trạng thái"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px] text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizers.map((org) => (
                  <TableRow key={org.id} className="hover:bg-zinc-50">
                    <TableCell className="font-medium" title={org.cccd}>
                      {getCompactId(org.cccd)}
                    </TableCell>
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
                      {getPersonDisplayName(org)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getOrgDisplayName(org)}
                    </TableCell>
                    <TableCell>{org.phone}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell className="text-center">{org.events}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(org.status)}</TableCell>
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
        <Dialog
          open={openDetailModal}
          onOpenChange={(open) => {
            setOpenDetailModal(open);
            if (!open) {
              setSelectedHostId(undefined);
              setActivitySearchQuery('');
              setActivityStatusFilter('all');
            }
          }}
        >
          <DialogContent className="max-w-5xl overflow-hidden border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-0 shadow-2xl shadow-blue-100/50">
            <DialogHeader>
              <div className="border-b border-blue-100/80 bg-white/70 px-6 pt-6 pb-4 backdrop-blur-sm">
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Chi tiết thông tin người tổ chức
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Xem thông tin chi tiết của người tổ chức sự kiện
                </DialogDescription>
              </div>
            </DialogHeader>

            {selectedUser && (
              <div className="grid gap-5 px-6 pb-6 pt-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-100/35">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border border-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50">
                      <AvatarImage src={detailAvatar} alt={detailFullName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-2xl font-semibold text-white">
                        {detailFullName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      {detailFullName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">Host</p>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-zinc-200 pt-4 text-sm">
                    <p className="text-zinc-700 break-all">
                      <span className="font-semibold text-zinc-500">ID:</span>{' '}
                      {detailId}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">CCCD:</span>{' '}
                      {detailCid}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Số điện thoại:
                      </span>{' '}
                      {detailPhone}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Email:
                      </span>{' '}
                      {detailEmail}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Ngày sinh:
                      </span>{' '}
                      {detailDob}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Giới tính:
                      </span>{' '}
                      {detailGender}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Địa chỉ:
                      </span>{' '}
                      {detailAddress}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Địa chỉ chi tiết:
                      </span>{' '}
                      {detailDetailAddress}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Ngày tạo:
                      </span>{' '}
                      {detailCreatedAt}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-100/35">
                  <h3 className="text-3xl font-bold text-slate-900">
                    Lịch sử sự kiện đã tham gia
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Danh sách sự kiện host đã tham gia.
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                    <Input
                      placeholder="Tìm kiếm theo tên sự kiện..."
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      className="bg-white border-zinc-200"
                    />
                    <Select
                      value={activityStatusFilter}
                      onValueChange={setActivityStatusFilter}
                    >
                      <SelectTrigger className="bg-white border-zinc-200">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {availableActivityStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {EVENT_STATUS_LABELS[status as EEventStatus] ||
                              status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isHostActivitiesLoading ? (
                    <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                      <p className="text-sm font-medium text-zinc-700">
                        Đang tải dữ liệu lịch sử sự kiện...
                      </p>
                    </div>
                  ) : filteredHostActivities.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                      <p className="text-sm font-medium text-zinc-700">
                        Chưa có dữ liệu lịch sử sự kiện
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto overflow-y-auto max-h-[500px] rounded-xl border border-zinc-200">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên sự kiện</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead>Bắt đầu</TableHead>
                            <TableHead>Kết thúc</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHostActivities.map((activity) => (
                            <TableRow
                              key={activity.sessionId}
                              className="cursor-pointer hover:bg-zinc-100"
                              onClick={() => router.push(`/dashboard/organizers-list/events/${activity.eventId}`)}
                            >
                              <TableCell className="font-medium">
                                {activity.eventName || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getBadgeClassNameByStatus(
                                    String(activity.eventStatus || '')
                                  )}
                                >
                                  {activity.eventStatus
                                    ? EVENT_STATUS_LABELS[
                                        activity.eventStatus as EEventStatus
                                      ] || activity.eventStatus
                                    : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {[activity.eventAddress, activity.eventDetailAddress]
                                  .filter(Boolean)
                                  .join(' - ') || '-'}
                              </TableCell>
                              <TableCell>
                                {formatDateTimeVi(activity.sessionStartTime)}
                              </TableCell>
                              <TableCell>
                                {formatDateTimeVi(activity.sessionEndTime)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Edit Organizer Modal */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-zinc-900 dark:text-white">
                Cập nhật thông tin người tổ chức
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Chỉnh sửa thông tin cơ bản của người tổ chức
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5 relative">
              {isLoadingEditDetails && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
                    Đang tải thông tin...
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-5">
                <Avatar className="h-24 w-24 border border-white shadow-lg shadow-purple-100/50 ring-4 ring-purple-50">
                  {avatarPreview ? (
                    <AvatarImage
                      src={avatarPreview}
                      alt={editOrganizer.fullName || selectedEditUser?.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500 text-2xl font-semibold text-white">
                    {(editOrganizer.fullName || selectedEditUser?.fullName || 'U')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-900">
                    Ảnh đại diện người tổ chức
                  </p>
                  <p className="text-xs text-zinc-500">
                    JPG hoặc PNG, dung lượng nhỏ hơn 5MB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarFile ? 'Đổi ảnh khác' : 'Chọn ảnh'}
                </Button>
              </div>

              <div className="space-y-4">
                {/* Mã Host (ID) - Read only */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Mã Host (ID)
                  </label>
                  <Input
                    value={editHostUuid || selectedEditUser?.cccd || '-'}
                    disabled
                    className="mt-1 bg-zinc-100 text-zinc-500 cursor-not-allowed"
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Giới tính
                  </label>
                  <Select
                    value={editOrganizer.gender ? 'male' : 'female'}
                    onValueChange={(value) =>
                      setEditOrganizer({
                        ...editOrganizer,
                        gender: value === 'male'
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200">
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Địa chỉ
                </label>
                <Input
                  placeholder="Nhập địa chỉ"
                  value={editOrganizer.address}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      address: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Địa chỉ chi tiết
                </label>
                <Input
                  placeholder="Nhập địa chỉ chi tiết"
                  value={editOrganizer.detailAddress}
                  onChange={(e) =>
                    setEditOrganizer({
                      ...editOrganizer,
                      detailAddress: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 px-6 pb-6">
            <Button
              onClick={() => setOpenEditModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSavingOrganizer}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSavingOrganizer || isLoadingEditDetails}
            >
              {isSavingOrganizer ? 'Đang lưu...' : isLoadingEditDetails ? 'Đang tải...' : 'Cập nhật'}
            </Button>
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
