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
import { Eye, Lock, Plus } from 'lucide-react';
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
  const [organizers, setOrganizers] = useState(mockOrganizers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockOrganizers)[0] | null
  >(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLockUser, setSelectedLockUser] = useState<
    (typeof mockOrganizers)[0] | null
  >(null);
  const [openLockModal, setOpenLockModal] = useState(false);
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dobFrom, setDobFrom] = useState('');
  const [dobTo, setDobTo] = useState('');
  const [sortField, setSortField] = useState('none');
  const [sortOrder, setSortOrder] = useState('desc');
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
  const filteredOrganizers = useMemo(() => {
    const parseDob = (dob: string) => {
      const [day, month, year] = dob.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const fromDate = dobFrom ? new Date(dobFrom) : null;
    const toDate = dobTo ? new Date(dobTo) : null;

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

    if (statusFilter !== 'all') {
      result = result.filter((org) => org.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      result = result.filter((org) => org.role === roleFilter);
    }

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
        if (sortField === 'events') return (a.events - b.events) * order;
        return 0;
      });
    }

    return result;
  }, [
    organizers,
    searchField,
    searchQuery,
    statusFilter,
    roleFilter,
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
        <div className="sticky top-0 z-20 -mx-1 mb-4 bg-white/90 px-1 py-3 backdrop-blur dark:bg-zinc-950/90">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1">
              <Select
                value={searchField}
                onValueChange={(value) => {
                  setSearchField(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
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
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="locked">Đã khóa</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Host">Host</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dobFrom}
              onChange={(e) => {
                setDobFrom(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Input
              type="date"
              value={dobTo}
              onChange={(e) => {
                setDobTo(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              value={sortField}
              onValueChange={(value) => {
                setSortField(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không sắp xếp</SelectItem>
                <SelectItem value="events">Số sự kiện</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) => {
                setSortOrder(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead className="min-w-[160px]">Tên tổ chức</TableHead>
                  <TableHead className="min-w-[150px]">Họ và tên</TableHead>
                  <TableHead className="min-w-[130px]">CCCD</TableHead>
                  <TableHead className="min-w-[120px]">Số điện thoại</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="w-[100px]">Ngày sinh</TableHead>
                  <TableHead className="w-[120px] text-center whitespace-nowrap">
                    Số sự kiện
                  </TableHead>
                  <TableHead className="w-[120px]">Vai trò</TableHead>
                  <TableHead className="w-[110px]">Trạng thái</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizers.map((org) => (
                  <TableRow key={org.id}>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết thông tin người tổ chức</DialogTitle>
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
        {/* Lock Confirmation Modal */}
        <Dialog open={openLockModal} onOpenChange={setOpenLockModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
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
              <Button variant="outline" onClick={() => setOpenLockModal(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirmLock}
                className="bg-red-600 hover:bg-red-700"
              >
                Xác nhận
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Add Host Modal */}
        <Dialog open={openAddHostModal} onOpenChange={setOpenAddHostModal}>
          <DialogContent className="max-w-2xl bg-white dark:bg-white">
            <DialogHeader>
              <DialogTitle className="text-blue-600">
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
                variant="outline"
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
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddHost}
                className="bg-blue-600 hover:bg-blue-700"
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
