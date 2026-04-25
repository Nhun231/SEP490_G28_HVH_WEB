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
  CalendarDays,
  ChevronRight,
  Eye,
  Filter as Funnel,
  ListFilter,
  Lock,
  MapPin,
  Plus,
  Star,
  Pencil,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useViewVolunteerList } from '@/hooks/features/sys-admin/uc029-view-volunteer-account-list/useViewVolunteerList';
import { useGetVolunteerActivities } from '@/hooks/features/sys-admin/uc030-get-volunteer-details/useGetVolunteerActivities';
import { useGetVolDetails } from '@/hooks/features/sys-admin/uc030-get-volunteer-details/useGetVolDetails';
import { useUpdateVolAccbyAdmin } from '@/hooks/features/sys-admin/uc032-update-volunteer-account-profile/useUpdateVolAccbyAdmin';
import { useCreateVolAccount } from '@/hooks/features/sys-admin/uc031-create-volunteer-account/useCreateVolAccount';
import type { VolunteerAccountInformationResponse } from '@/hooks/dto';
import { EEmployStatus, EEducationLevel } from '@/hooks/dto';
import { useUploadFiles } from '@/hooks/features/commons/bucket/useUploadFiles';
import { toast } from 'sonner';
import { getOrCreateDeviceId } from '@/hooks/use-notification-permission';
import { getFullSupabaseImageUrl } from '@/utils/helpers';
import {
  getEmployStatusViLabel,
  getGraduationStatusViLabel
} from '@/constants/volunteer-status-vi';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

type VolunteerActivityStatus = 'completed' | 'ongoing' | 'cancelled';

type VolunteerActivity = {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  location: string;
  rating: number;
  reputationGain: number;
  status: VolunteerActivityStatus;
};

const mapAccountStatus = (
  status: string | null | undefined
): 'active' | 'inactive' | 'locked' => {
  if (status === 'ACTIVE') return 'active';
  return 'locked';
};

export default function VolunteersList(props: Props) {
  const router = useRouter();

  type Volunteer = {
    id: string;
    avatar: string;
    fullName: string;
    cccd: string;
    phone: string;
    email: string;
    dob: string;
    address: string;
    detailAddress: string;
    events: number;
    rating: number;
    reputation: number;
    status: 'active' | 'inactive' | 'locked';
  };
  type SortKey =
    | 'none'
    | 'id'
    | 'fullName'
    | 'cccd'
    | 'phone'
    | 'email'
    | 'dob'
    | 'events'
    | 'rating'
    | 'reputation'
    | 'status';
  type SortOrder = 'asc' | 'desc';
  type SortCriterion = { key: Exclude<SortKey, 'none'>; order: SortOrder };
  type ValueFilterKey = 'fullName' | 'cccd' | 'phone' | 'email' | 'status';

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const {
    data: volunteerListData,
    isLoading,
    error,
    mutate: refreshVolunteerList
  } = useViewVolunteerList({
    pageNumber: 0,
    pageSize: 100,
    baseUrl,
    enabled: true
  });
  const [users, setUsers] = useState<Volunteer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Volunteer | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLockUser, setSelectedLockUser] = useState<Volunteer | null>(
    null
  );
  const [openLockModal, setOpenLockModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditUserId, setSelectedEditUserId] = useState<string | null>(
    null
  );
  const [selectedEditUser, setSelectedEditUser] =
    useState<VolunteerAccountInformationResponse | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingVolunteer, setIsSavingVolunteer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activityQuery, setActivityQuery] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState<
    'all' | VolunteerActivityStatus
  >('all');
  const [editVolunteer, setEditVolunteer] = useState({
    fullName: '',
    cccd: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    detailAddress: '',
    vid: '',
    nickname: '',
    bio: '',
    gender: true,
    employStatus: EEmployStatus.OTHER,
    educationLevel: EEducationLevel.OTHER,
    sid: '',
    workAddress: ''
  });
  const [newVolunteer, setNewVolunteer] = useState({
    fullName: '',
    cid: '',
    phone: '',
    email: ''
  });
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [dobFrom, setDobFrom] = useState('');
  const [dobTo, setDobTo] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [columnValueFilters, setColumnValueFilters] = useState<
    Partial<Record<ValueFilterKey, string[]>>
  >({});
  const pageSize = 10;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { uploadFileToSignedUrl } = useUploadFiles();
  const { trigger: updateVolunteerProfile } = useUpdateVolAccbyAdmin({
    id: selectedEditUser?.id ?? '',
    baseUrl
  });
  const { trigger: createVolAccount } = useCreateVolAccount({ baseUrl });
  const {
    data: volunteerActivitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError
  } = useGetVolunteerActivities({
    id: selectedUser?.id,
    baseUrl,
    enabled: openDetailModal && Boolean(selectedUser?.id)
  });

  const {
    data: volunteerDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useGetVolDetails({
    id: selectedUser?.id,
    baseUrl,
    enabled: openDetailModal && Boolean(selectedUser?.id)
  });

  const { data: volunteerEditDetails } = useGetVolDetails({
    id: selectedEditUserId,
    baseUrl,
    enabled: openEditModal && Boolean(selectedEditUserId)
  });

  const formatDateForDisplay = (value: string | null | undefined) => {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  const formatDateTimeForDisplay = (value: string | null | undefined) => {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';

    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const mapActivityStatus = (
    applicationStatus: string | null | undefined,
    eventStatus: string | null | undefined
  ): VolunteerActivityStatus => {
    const normalizedApplicationStatus = applicationStatus?.toUpperCase();
    const normalizedEventStatus = eventStatus?.toUpperCase();

    if (
      normalizedApplicationStatus === 'REJECTED' ||
      normalizedApplicationStatus === 'CANCELLED' ||
      normalizedEventStatus === 'CANCELLED'
    ) {
      return 'cancelled';
    }

    if (
      normalizedApplicationStatus === 'COMPLETED' ||
      normalizedApplicationStatus === 'APPROVED' ||
      normalizedEventStatus === 'COMPLETED' ||
      normalizedEventStatus === 'ENDED'
    ) {
      return 'completed';
    }

    return 'ongoing';
  };

  const shortenId = (id: string) => {
    if (!id) return '';
    if (id.length <= 14) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  useEffect(() => {
    const content = volunteerListData?.content ?? [];
    const mappedUsers = content.map((item, index) => ({
      id: item.id,
      avatar:
        getFullSupabaseImageUrl(item.avatarUrl) ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.fullName ?? item.vid ?? String(index + 1))}`,
      fullName: item.fullName ?? 'Chưa cập nhật',
      cccd: item.cid ?? 'Chưa cập nhật',
      phone: item.phone ?? 'Chưa cập nhật',
      email: item.email ?? 'Chưa cập nhật',
      dob: formatDateForDisplay(item.dob),
      address: item.address ?? 'Chưa cập nhật',
      detailAddress: item.detailAddress ?? 'Chưa cập nhật',
      events: item.activityCount ?? 0,
      rating: item.avgRating ?? 0,
      reputation: item.creditScore ?? 0,
      status: mapAccountStatus(item.status)
    }));

    setUsers(mappedUsers);
  }, [volunteerListData]);

  useEffect(() => {
    if (!openEditModal || !volunteerEditDetails) return;

    setSelectedEditUser(volunteerEditDetails);
    setEditVolunteer((prev) => ({
      ...prev,
      fullName: volunteerEditDetails.fullName || '',
      cccd: volunteerEditDetails.cid || '',
      phone: volunteerEditDetails.phone || '',
      email: volunteerEditDetails.email || '',
      dob: formatDobForInput(volunteerEditDetails.dob || ''),
      address:
        volunteerEditDetails.address === 'Chưa cập nhật'
          ? ''
          : (volunteerEditDetails.address ?? ''),
      detailAddress:
        volunteerEditDetails.detailAddress === 'Chưa cập nhật'
          ? ''
          : (volunteerEditDetails.detailAddress ?? ''),
      vid: volunteerEditDetails.id || '',
      nickname: volunteerEditDetails.nickname || '',
      bio: volunteerEditDetails.bio || '',
      gender: volunteerEditDetails.gender ?? true,
      employStatus: volunteerEditDetails.employStatus || EEmployStatus.OTHER,
      educationLevel:
        volunteerEditDetails.educationLevel || EEducationLevel.OTHER,
      sid: volunteerEditDetails.sid || '',
      workAddress: volunteerEditDetails.workAddress || ''
    }));
    setAvatarPreview(getFullSupabaseImageUrl(volunteerEditDetails.avatarUrl));
  }, [openEditModal, volunteerEditDetails]);

  const setSortForKey = (key: SortKey, order: SortOrder) => {
    if (key === 'none') return;
    setSortCriteria((prev) => {
      const next = prev.filter((c) => c.key !== key);
      next.unshift({ key, order });
      return next;
    });
    setCurrentPage(1);
  };

  const clearSortForKey = (key: SortKey) => {
    if (key === 'none') return;
    setSortCriteria((prev) => prev.filter((c) => c.key !== key));
    setCurrentPage(1);
  };
  const formatDobForInput = (dob: string) => {
    if (!dob || dob === 'Chưa cập nhật') return '';
    if (dob.includes('/')) {
      const [day, month, year] = dob.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;

    const parsed = new Date(dob);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
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
      // remove accents/diacritics
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const getFilterValueForKey = (user: Volunteer, key: ValueFilterKey) => {
    switch (key) {
      case 'fullName':
        return normalizeForFilter(user.fullName);
      case 'cccd':
        return normalizeForFilter(user.cccd);
      case 'phone':
        return normalizeForFilter(user.phone);
      case 'email':
        return normalizeForFilter(user.email).toLowerCase();
      case 'status':
        return normalizeForFilter(user.status);
      default:
        return '';
    }
  };

  const getUniqueValuesForKey = (key: ValueFilterKey) => {
    const values = users
      .map((u) => getFilterValueForKey(u, key))
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
      [users]
    );
    const applied = columnValueFilters[columnKey] ?? [];
    const hasActiveFilter = applied.length > 0;
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) &&
      ((searchField === 'name' && columnKey === 'fullName') ||
        (searchField === 'cccd' && columnKey === 'cccd') ||
        (searchField === 'phone' && columnKey === 'phone') ||
        (searchField === 'email' && columnKey === 'email'));
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
            className={`h-7 w-7 p-0 ${
              isActive ? 'text-primary' : 'text-zinc-500'
            }`}
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

  const DobFilterDropdown = () => {
    const [open, setOpen] = useState(false);
    const [localFrom, setLocalFrom] = useState(dobFrom);
    const [localTo, setLocalTo] = useState(dobTo);
    const hasActive = Boolean(dobFrom || dobTo);
    const isSortActive = sortCriteria.some((c) => c.key === 'dob');
    const isActive = hasActive || isSortActive;

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
            className={`h-7 w-7 p-0 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
            aria-label="Bộ lọc cột Ngày sinh"
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
              setSortForKey('dob', 'asc');
            }}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Sắp xếp tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setSortForKey('dob', 'desc');
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
                  clearSortForKey('dob');
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
    const isActive =
      sortKey !== 'none' && sortCriteria.some((c) => c.key === sortKey);
    const isSearchFilteringThisColumn =
      Boolean(searchQuery.trim()) && sortKey === 'id' && searchField === 'id';
    const isApplied = isActive || isSearchFilteringThisColumn;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 p-0 ${
              isApplied ? 'text-primary' : 'text-zinc-500'
            }`}
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

  const filteredUsers = useMemo(() => {
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

    let result = users.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      switch (searchField) {
        case 'id':
          return String(user.id).toLowerCase().includes(query);
        case 'name':
          return user.fullName.toLowerCase().includes(query);
        case 'cccd':
          return user.cccd.includes(query);
        case 'phone':
          return user.phone.includes(query);
        case 'email':
          return user.email.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    (Object.keys(columnValueFilters) as ValueFilterKey[]).forEach((key) => {
      const selected = columnValueFilters[key] ?? [];
      if (selected.length === 0) return;
      result = result.filter((u) => {
        const v = getFilterValueForKey(u, key);
        return selected.includes(v);
      });
    });

    if (fromDate || toDate) {
      result = result.filter((user) => {
        const userDate = parseDob(user.dob);
        if (fromDate && userDate < fromDate) return false;
        if (toDate && userDate > toDate) return false;
        return true;
      });
    }

    if (sortCriteria.length > 0) {
      result = [...result].sort((a, b) => {
        for (const criterion of sortCriteria) {
          const order = criterion.order === 'asc' ? 1 : -1;
          const key = criterion.key;

          if (key === 'id') {
            const diff = a.id.localeCompare(b.id);
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'events') {
            const diff = a.events - b.events;
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'rating') {
            const diff = a.rating - b.rating;
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'reputation') {
            const diff = a.reputation - b.reputation;
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'dob') {
            const diff = parseDob(a.dob).getTime() - parseDob(b.dob).getTime();
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'fullName') {
            const diff = a.fullName.localeCompare(b.fullName);
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'email') {
            const diff = a.email.localeCompare(b.email);
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'phone') {
            const diff = a.phone.localeCompare(b.phone);
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'cccd') {
            const diff = a.cccd.localeCompare(b.cccd);
            if (diff !== 0) return diff * order;
            continue;
          }
          if (key === 'status') {
            const diff = a.status.localeCompare(b.status);
            if (diff !== 0) return diff * order;
            continue;
          }
        }
        return 0;
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    users,
    searchField,
    searchQuery,
    dobFrom,
    dobTo,
    sortCriteria,
    columnValueFilters
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const volunteerActivities = useMemo(() => {
    const activities = Array.isArray(volunteerActivitiesData)
      ? volunteerActivitiesData
      : (volunteerActivitiesData?.content ?? []);

    return activities.map((activity, index) => ({
      id: activity.sessionId || `${activity.eventId}-${index}`,
      eventId: activity.eventId || '',
      eventName: activity.eventName ?? 'Sự kiện chưa cập nhật',
      date: formatDateTimeForDisplay(activity.sessionStartTime),
      location:
        [activity.eventDetailAddress, activity.eventAddress]
          .filter(Boolean)
          .join(', ') || 'Chưa cập nhật',
      rating: activity.sessionRating ?? 0,
      reputationGain: activity.sessionCreditHour ?? 0,
      status: mapActivityStatus(
        activity.applicationStatus,
        activity.eventStatus
      )
    }));
  }, [volunteerActivitiesData]);

  const handleOpenVolunteerActivityEvent = (eventId: string) => {
    const trimmedId = eventId?.trim();
    if (!trimmedId) return;

    setOpenDetailModal(false);
    router.push(`/dashboard/volunteers-list/events/${trimmedId}`);
  };

  const filteredVolunteerActivities = useMemo(() => {
    const query = activityQuery.trim().toLowerCase();

    return volunteerActivities.filter((activity) => {
      const matchesQuery =
        !query ||
        activity.eventName.toLowerCase().includes(query) ||
        activity.location.toLowerCase().includes(query);
      const matchesStatus =
        activityStatusFilter === 'all' ||
        activity.status === activityStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [activityQuery, activityStatusFilter, volunteerActivities]);

  const handleView = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setActivityQuery('');
      setActivityStatusFilter('all');
      setOpenDetailModal(true);
    }
  };

  const handleLock = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedLockUser(user);
      setOpenLockModal(true);
    }
  };

  const handleEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setSelectedEditUserId(userId);
    setSelectedEditUser(user as any);
    setEditVolunteer({
      fullName: user.fullName,
      cccd: user.cccd,
      phone: user.phone,
      email: user.email,
      dob: formatDobForInput(user.dob),
      address: user.address === 'Chưa cập nhật' ? '' : user.address,
      detailAddress:
        user.detailAddress === 'Chưa cập nhật' ? '' : user.detailAddress,
      vid: user.id,
      nickname: (user as any).nickname || '',
      bio: (user as any).bio || '',
      gender: (user as any).gender ?? true,
      employStatus: (user as any).employStatus || EEmployStatus.OTHER,
      educationLevel: (user as any).educationLevel || EEducationLevel.OTHER,
      sid: (user as any).sid || '',
      workAddress: (user as any).workAddress || ''
    });
    setAvatarPreview(user.avatar);
    setAvatarFile(null);
    setOpenEditModal(true);
  };

  const handleConfirmLock = () => {
    if (!selectedLockUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedLockUser.id
          ? {
              ...user,
              status: user.status === 'locked' ? 'active' : 'locked'
            }
          : user
      )
    );
    setOpenLockModal(false);
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

  const editAvatarSrc =
    avatarPreview ||
    getFullSupabaseImageUrl(selectedEditUser?.avatarUrl) ||
    undefined;

  const handleConfirmEdit = async () => {
    if (!selectedEditUser) return;

    const nextDeviceId = getOrCreateDeviceId();
    const currentAvatarUrl =
      users.find((user) => user.id === selectedEditUser.id)?.avatar ??
      selectedUser?.avatar ??
      '';
    const avatarExtension = avatarFile
      ? avatarFile.name.split('.').pop()
      : null;
    const normalizedDob = formatDobForInput(editVolunteer.dob);
    const newErrors: Record<string, string> = {};
    const requiredFieldLabels: Record<string, string> = {
      fullName: 'Họ và tên',
      cccd: 'CCCD',
      phone: 'Số điện thoại',
      email: 'Email',
      dob: 'Ngày sinh',
      address: 'Địa chỉ',
      detailAddress: 'Địa chỉ chi tiết'
    };

    if (!editVolunteer.fullName.trim())
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!editVolunteer.cccd.trim()) newErrors.cccd = 'Vui lòng nhập CCCD';
    if (!editVolunteer.phone.trim())
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!editVolunteer.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!normalizedDob) newErrors.dob = 'Vui lòng nhập ngày sinh';
    if (!editVolunteer.address.trim())
      newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!editVolunteer.detailAddress.trim())
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

    const requestData: any = {
      email: (selectedEditUser.email || editVolunteer.email).trim(),
      phone: editVolunteer.phone.trim(),
      cid: editVolunteer.cccd.trim(),
      nickName: editVolunteer.nickname.trim() || editVolunteer.fullName.trim(),
      fullName: editVolunteer.fullName.trim(),
      bio: editVolunteer.bio.trim() || editVolunteer.fullName.trim(),
      gender: editVolunteer.gender,
      dob: normalizedDob || '',
      address: editVolunteer.address.trim(),
      detailAddress: editVolunteer.detailAddress.trim(),
      employStatus: editVolunteer.employStatus,
      workAddress:
        editVolunteer.workAddress.trim() || editVolunteer.address.trim(),
      educationLevel: editVolunteer.educationLevel,
      sid: editVolunteer.sid.trim() || editVolunteer.cccd.trim(),
      deviceId: nextDeviceId
    };

    if (avatarFile) {
      requestData.avatarExtension = avatarExtension
        ? `.${avatarExtension}`
        : '';
    }

    try {
      setIsSavingVolunteer(true);
      const response = await updateVolunteerProfile(requestData);

      if (avatarFile && response?.avatarUploadUrl) {
        const uploadUrl = response.avatarUploadUrl.startsWith('http')
          ? response.avatarUploadUrl
          : `${SUPABASE_URL?.replace(/\/$/, '')}${response.avatarUploadUrl}`;

        const uploadResult = await uploadFileToSignedUrl(avatarFile, uploadUrl);
        if (!uploadResult?.success) {
          throw new Error(uploadResult?.error || 'Không thể upload avatar');
        }
      }

      const nextAvatar = response?.avatarUrl
        ? getFullSupabaseImageUrl(response.avatarUrl)
        : (avatarPreview ?? currentAvatarUrl);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedEditUser.id
            ? {
                ...user,
                avatar: nextAvatar,
                fullName: requestData.fullName,
                cccd: requestData.cid,
                phone: requestData.phone,
                email: requestData.email,
                dob: formatDobForDisplay(requestData.dob),
                address: requestData.address,
                detailAddress: requestData.detailAddress,
                nickName: requestData.nickName,
                nickname: requestData.nickName,
                bio: requestData.bio,
                gender: requestData.gender,
                employStatus: requestData.employStatus,
                workAddress: requestData.workAddress,
                educationLevel: requestData.educationLevel,
                sid: requestData.sid,
                deviceId: requestData.deviceId
              }
            : user
        )
      );

      if (selectedUser?.id === selectedEditUser.id) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                avatar: nextAvatar,
                fullName: requestData.fullName,
                cccd: requestData.cid,
                phone: requestData.phone,
                email: requestData.email,
                dob: formatDobForDisplay(requestData.dob),
                address: requestData.address,
                detailAddress: requestData.detailAddress,
                nickName: requestData.nickName,
                nickname: requestData.nickName,
                bio: requestData.bio,
                gender: requestData.gender,
                employStatus: requestData.employStatus,
                workAddress: requestData.workAddress,
                educationLevel: requestData.educationLevel,
                sid: requestData.sid,
                deviceId: requestData.deviceId
              }
            : prev
        );
      }

      toast.success('Cập nhật tình nguyện viên thành công!');
      await refreshVolunteerList();
      setOpenEditModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error?.message || 'Cập nhật tình nguyện viên thất bại');
    } finally {
      setIsSavingVolunteer(false);
    }
  };

  const handleAddVolunteer = async () => {
    // Validate each field individually
    if (!newVolunteer.fullName?.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!newVolunteer.cid?.trim()) {
      toast.error('Vui lòng nhập số CMND/CCCD');
      return;
    }
    if (!newVolunteer.phone?.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!newVolunteer.email?.trim()) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }

    try {
      await createVolAccount({
        fullName: newVolunteer.fullName,
        cid: newVolunteer.cid,
        phone: newVolunteer.phone,
        email: newVolunteer.email
      });
      
      toast.success('Tạo tài khoản tình nguyện viên thành công');
      setNewVolunteer({
        fullName: '',
        cid: '',
        phone: '',
        email: ''
      });
      setOpenAddModal(false);
      refreshVolunteerList();
    } catch (error: any) {
      toast.error(error?.message || 'Tạo tài khoản tình nguyện viên thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 hover:text-white">
            Kích hoạt
          </Badge>
        );
      case 'locked':
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-500 hover:text-white">
            Khóa
          </Badge>
        );
      default:
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-500 hover:text-white">
            Khóa
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Quản Lý Tình Nguyện Viên"
      description="Quản lý danh sách tình nguyện viê4n"
    >
      <div className="w-full">
        <div className="sticky top-0 z-30 -mx-1 mb-4 px-1 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:flex-1 md:items-center">
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
              onClick={() => setOpenAddModal(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="px-6 py-8 text-center text-sm text-zinc-500">
              Đang tải danh sách tình nguyện viên...
            </div>
          )}
          {error && (
            <div className="px-6 py-8 text-center text-sm text-rose-500">
              Không thể tải danh sách tình nguyện viên.
            </div>
          )}
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
                  <TableHead className="w-[100px] text-center">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-full text-center">Rating TB</span>
                      <SortOnlyDropdown sortKey="rating" label="Rating TB" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[110px] text-center">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-full text-center">Điểm uy tín</span>
                      <SortOnlyDropdown
                        sortKey="reputation"
                        label="Điểm uy tín"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px]">
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
                {!isLoading &&
                  !error &&
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-zinc-50">
                      <TableCell className="font-medium" title={user.id}>
                        {shortenId(user.id)}
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback>
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.cccd}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.dob}</TableCell>
                      <TableCell className="text-center">
                        {user.events}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{user.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{user.reputation}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleLock(user.id)}
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
          <DialogContent className="max-w-6xl overflow-hidden border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-0 shadow-2xl shadow-blue-100/50">
            <DialogHeader>
              <div className="border-b border-blue-100/80 bg-white/70 px-6 pt-6 pb-4 backdrop-blur-sm">
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Chi tiết thông tin tình nguyện viên
                </DialogTitle>
                <DialogDescription className="mt-1 text-slate-500">
                  Thông tin chi tiết về tình nguyện viên được chọn
                </DialogDescription>
              </div>
            </DialogHeader>

            {volunteerDetails && (
              <div className="grid gap-5 px-6 pb-6 pt-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-100/35">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border border-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50">
                      <AvatarImage
                        src={
                          getFullSupabaseImageUrl(volunteerDetails.avatarUrl) ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${volunteerDetails.fullName}`
                        }
                        alt={volunteerDetails.fullName || 'Avatar'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-2xl font-semibold text-white">
                        {(volunteerDetails.fullName || 'TV')
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      {volunteerDetails.fullName || 'Chưa cập nhật'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Tình nguyện viên • {volunteerDetails.activityCount ?? 0}{' '}
                      hoạt động
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Badge
                        className={`rounded-full px-3 py-1 ${
                          selectedUser?.status === 'active'
                            ? 'border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        {selectedUser?.status === 'active'
                          ? 'Kích hoạt'
                          : 'Khóa'}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        Cấp {volunteerDetails.level ?? 0}
                      </Badge>
                      {volunteerDetails.phoneVerified && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-blue-200 text-blue-700"
                        >
                          SĐT đã xác minh
                        </Badge>
                      )}
                    </div>
                    {volunteerDetails.bio && (
                      <p className="mt-3 text-sm text-slate-600 italic max-w-[280px]">
                        &ldquo;{volunteerDetails.bio}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-zinc-200 pt-4 text-sm">
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Mã TNV:
                      </span>{' '}
                      {volunteerDetails.vid || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">CCCD:</span>{' '}
                      {volunteerDetails.cid || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Số điện thoại:
                      </span>{' '}
                      {volunteerDetails.phone || 'Chưa cập nhật'}
                      {volunteerDetails.phoneVerified && (
                        <span className="text-emerald-600 ml-1">✓</span>
                      )}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Email:
                      </span>{' '}
                      {volunteerDetails.email || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Ngày sinh:
                      </span>{' '}
                      {formatDateForDisplay(volunteerDetails.dob)}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Giới tính:
                      </span>{' '}
                      {volunteerDetails.gender ? 'Nam' : 'Nữ'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Địa chỉ:
                      </span>{' '}
                      {volunteerDetails.address || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Địa chỉ chi tiết:
                      </span>{' '}
                      {volunteerDetails.detailAddress || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Địa chỉ làm việc:
                      </span>{' '}
                      {volunteerDetails.workAddress || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Trạng thái việc làm:
                      </span>{' '}
                      {getEmployStatusViLabel(volunteerDetails.employStatus)}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Trình độ học vấn:
                      </span>{' '}
                      {getGraduationStatusViLabel(
                        volunteerDetails.educationLevel
                      )}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Mã HS/SV:
                      </span>{' '}
                      {volunteerDetails.sid || 'Chưa cập nhật'}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Điểm đánh giá TB:
                      </span>{' '}
                      {volunteerDetails.avgRating ?? 0}/5
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Điểm uy tín:
                      </span>{' '}
                      {volunteerDetails.creditScore ?? 0}
                    </p>
                    <p className="text-zinc-700">
                      <span className="font-semibold text-zinc-500">
                        Điểm vinh dự:
                      </span>{' '}
                      {volunteerDetails.honorScore ?? 0}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-100/35">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Lịch sử hoạt động thiện nguyện
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Danh sách các hoạt động đã tham gia (
                    {filteredVolunteerActivities.length} hoạt động)
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        value={activityQuery}
                        onChange={(e) => setActivityQuery(e.target.value)}
                        placeholder="Tìm kiếm theo tên hoạt động..."
                        className="pl-9"
                      />
                    </div>
                    <Select
                      value={activityStatusFilter}
                      onValueChange={(value) =>
                        setActivityStatusFilter(
                          value as 'all' | VolunteerActivityStatus
                        )
                      }
                    >
                      <SelectTrigger className="bg-white border-zinc-200 text-zinc-900">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-zinc-900 border border-zinc-200">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {isLoadingActivities ? (
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                        Đang tải lịch sử hoạt động...
                      </div>
                    ) : activitiesError ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                        Không thể tải lịch sử hoạt động.
                      </div>
                    ) : filteredVolunteerActivities.length === 0 ? (
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                        Không có hoạt động phù hợp.
                      </div>
                    ) : (
                      filteredVolunteerActivities.map((activity) => (
                        <div
                          key={activity.id}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleOpenVolunteerActivityEvent(activity.eventId)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenVolunteerActivityEvent(
                                activity.eventId
                              );
                            }
                          }}
                          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-zinc-900">
                              {activity.eventName}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`rounded-full px-2.5 py-0.5 text-xs ${
                                  activity.status === 'completed'
                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : activity.status === 'ongoing'
                                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                      : 'border border-rose-200 bg-rose-50 text-rose-700'
                                }`}
                              >
                                {activity.status === 'completed'
                                  ? 'Hoàn thành'
                                  : activity.status === 'ongoing'
                                    ? 'Đang diễn ra'
                                    : 'Đã hủy'}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-zinc-400" />
                            </div>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-zinc-600">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <p className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" />
                                {activity.date}
                              </p>
                              <p className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {activity.location}
                              </p>
                            </div>
                            <p className="inline-flex items-center gap-1.5">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              Rating: {activity.rating}
                              <ShieldCheck className="h-4 w-4 ml-3 text-blue-500" />
                              +{activity.reputationGain} điểm uy tín
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Volunteer Modal */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-zinc-900 dark:text-white">
                Cập nhật thông tin tình nguyện viên
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Chỉnh sửa thông tin cơ bản của tình nguyện viên
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-5">
                <Avatar className="h-24 w-24 border border-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50">
                  {editAvatarSrc ? (
                    <AvatarImage
                      src={editAvatarSrc}
                      alt={editVolunteer.fullName || selectedEditUser?.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-2xl font-semibold text-white">
                    {(
                      editVolunteer.fullName ||
                      selectedEditUser?.fullName ||
                      'U'
                    )
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-900">
                    Ảnh đại diện tình nguyện viên
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Họ và tên
                  </label>
                  <Input
                    placeholder="Nhập họ và tên đầy đủ"
                    value={editVolunteer.fullName}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        fullName: e.target.value
                      })
                    }
                    className="mt-1 text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Địa chỉ
                  </label>
                  <Input
                    placeholder="Nhập địa chỉ"
                    value={editVolunteer.address}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        address: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Mã TNV
                  </label>
                  <Input
                    value={selectedEditUser?.id || editVolunteer.vid}
                    readOnly
                    className="mt-1 bg-zinc-100 text-zinc-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Số điện thoại
                  </label>
                  <Input
                    placeholder="Nhập số điện thoại"
                    value={editVolunteer.phone}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        phone: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Số CCCD
                  </label>
                  <Input
                    placeholder="Nhập 12 số CCCD"
                    value={editVolunteer.cccd}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        cccd: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    value={editVolunteer.dob}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        dob: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Địa chỉ chi tiết
                  </label>
                  <Input
                    placeholder="Nhập địa chỉ chi tiết"
                    value={editVolunteer.detailAddress}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        detailAddress: e.target.value
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={selectedEditUser?.email || editVolunteer.email}
                    readOnly
                    className="mt-1 bg-zinc-100 text-zinc-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Thông tin bổ sung - editable */}
              <div className="border-t border-zinc-200 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-zinc-800">
                  Thông tin bổ sung
                </h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Nickname
                    </label>
                    <Input
                      placeholder="Nhập nickname"
                      value={editVolunteer.nickname}
                      onChange={(e) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          nickname: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Giới tính
                    </label>
                    <Select
                      value={editVolunteer.gender ? 'male' : 'female'}
                      onValueChange={(value) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          gender: value === 'male'
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-zinc-200">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm font-medium text-zinc-700">
                    Giới thiệu (Bio)
                  </label>
                  <textarea
                    placeholder="Nhập giới thiệu về tình nguyện viên"
                    value={editVolunteer.bio}
                    onChange={(e) =>
                      setEditVolunteer({
                        ...editVolunteer,
                        bio: e.target.value
                      })
                    }
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Trạng thái việc làm
                    </label>
                    <Select
                      value={editVolunteer.employStatus}
                      onValueChange={(value) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          employStatus: value as EEmployStatus
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-zinc-200">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value={EEmployStatus.STUDENT}>
                          Học sinh / Sinh viên
                        </SelectItem>
                        <SelectItem value={EEmployStatus.EMPLOYED}>
                          Đang đi làm
                        </SelectItem>
                        <SelectItem value={EEmployStatus.UNEMPLOYED}>
                          Thất nghiệp
                        </SelectItem>
                        <SelectItem value={EEmployStatus.RETIRED}>
                          Đã nghỉ hưu
                        </SelectItem>
                        <SelectItem value={EEmployStatus.OTHER}>
                          Khác
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Trình độ học vấn
                    </label>
                    <Select
                      value={editVolunteer.educationLevel}
                      onValueChange={(value) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          educationLevel: value as EEducationLevel
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-zinc-200">
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value={EEducationLevel.SECONDARY}>
                          Trung học cơ sở
                        </SelectItem>
                        <SelectItem value={EEducationLevel.HIGH_SCHOOL}>
                          Trung học phổ thông
                        </SelectItem>
                        <SelectItem value={EEducationLevel.COLLEGE}>
                          Cao đẳng
                        </SelectItem>
                        <SelectItem value={EEducationLevel.UNDERGRADUATE}>
                          Đại học
                        </SelectItem>
                        <SelectItem value={EEducationLevel.POSTGRADUATE}>
                          Sau đại học
                        </SelectItem>
                        <SelectItem value={EEducationLevel.PROFESSIONAL}>
                          Chuyên môn
                        </SelectItem>
                        <SelectItem value={EEducationLevel.OTHER}>
                          Khác
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Mã HS/SV
                    </label>
                    <Input
                      placeholder="Nhập mã học sinh/sinh viên"
                      value={editVolunteer.sid}
                      onChange={(e) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          sid: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Địa chỉ làm việc
                    </label>
                    <Input
                      placeholder="Nhập địa chỉ làm việc"
                      value={editVolunteer.workAddress}
                      onChange={(e) =>
                        setEditVolunteer({
                          ...editVolunteer,
                          workAddress: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-200 bg-white px-6 py-4">
              <Button
                onClick={() => {
                  setOpenEditModal(false);
                  setSelectedEditUserId(null);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isSavingVolunteer}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmEdit}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSavingVolunteer}
              >
                {isSavingVolunteer ? 'Đang lưu...' : 'Cập nhật'}
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

        {/* Add Volunteer Modal */}
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">
                Tạo tài khoản tình nguyện viên mới
              </DialogTitle>
              <DialogDescription>
                Nhập thông tin tình nguyện viên mới
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Information Section */}
              <div>
                <h3 className="font-semibold text-sm text-red-600 dark:text-zinc-300 mb-3">
                  Thông tin bắt buộc
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nhập họ và tên đầy đủ"
                      value={newVolunteer.fullName}
                      onChange={(e) =>
                        setNewVolunteer({
                          ...newVolunteer,
                          fullName: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số CMND/CCCD <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập 12 số CMND/CCCD"
                        value={newVolunteer.cid}
                        onChange={(e) =>
                          setNewVolunteer({
                            ...newVolunteer,
                            cid: e.target.value
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập số điện thoại"
                        value={newVolunteer.phone}
                        onChange={(e) =>
                          setNewVolunteer({
                            ...newVolunteer,
                            phone: e.target.value
                          })
                        }
                        className="mt-1"
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
                      value={newVolunteer.email}
                      onChange={(e) =>
                        setNewVolunteer({
                          ...newVolunteer,
                          email: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => setOpenAddModal(false)}
                  className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddVolunteer}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Tạo tài khoản
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
