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
import { Eye, Lock, Star, Plus } from 'lucide-react';
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

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    fullName: 'Nguyễn Văn An',
    cccd: '001234567890',
    phone: '0912345678',
    email: 'nguyenvanan@example.com',
    dob: '15/05/1990',
    events: 12,
    rating: 4.5,
    reputation: 85,
    status: 'active'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    fullName: 'Trần Thị Bình',
    cccd: '001234567891',
    phone: '0987654321',
    email: 'tranthibinh@example.com',
    dob: '20/08/1995',
    events: 8,
    rating: 4.8,
    reputation: 92,
    status: 'active'
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    fullName: 'Lê Hoàng Cường',
    cccd: '001234567892',
    phone: '0901234567',
    email: 'lehoangcuong@example.com',
    dob: '10/12/1988',
    events: 5,
    rating: 4.2,
    reputation: 78,
    status: 'inactive'
  },
  {
    id: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    fullName: 'Phạm Thị Dung',
    cccd: '001234567893',
    phone: '0923456789',
    email: 'phamthidung@example.com',
    dob: '25/03/1992',
    events: 15,
    rating: 4.9,
    reputation: 95,
    status: 'active'
  },
  {
    id: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    fullName: 'Hoàng Văn Em',
    cccd: '001234567894',
    phone: '0934567890',
    email: 'hoangvanem@example.com',
    dob: '05/07/1993',
    events: 3,
    rating: 3.8,
    reputation: 65,
    status: 'locked'
  },
  {
    id: 6,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    fullName: 'Vũ Minh Phúc',
    cccd: '001234567895',
    phone: '0945678901',
    email: 'vuminhphuc@example.com',
    dob: '12/11/1991',
    events: 9,
    rating: 4.1,
    reputation: 80,
    status: 'active'
  },
  {
    id: 7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
    fullName: 'Đặng Thị Hạnh',
    cccd: '001234567896',
    phone: '0956789012',
    email: 'dangthihanh@example.com',
    dob: '09/02/1994',
    events: 6,
    rating: 4.3,
    reputation: 82,
    status: 'active'
  },
  {
    id: 8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
    fullName: 'Bùi Quốc Huy',
    cccd: '001234567897',
    phone: '0967890123',
    email: 'buiquochuy@example.com',
    dob: '22/09/1989',
    events: 4,
    rating: 3.9,
    reputation: 70,
    status: 'inactive'
  },
  {
    id: 9,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
    fullName: 'Phan Thị Lan',
    cccd: '001234567898',
    phone: '0978901234',
    email: 'phanthilan@example.com',
    dob: '18/01/1996',
    events: 11,
    rating: 4.6,
    reputation: 88,
    status: 'active'
  },
  {
    id: 10,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
    fullName: 'Đỗ Đức Long',
    cccd: '001234567899',
    phone: '0989012345',
    email: 'doducbllong@example.com',
    dob: '03/06/1990',
    events: 7,
    rating: 4.0,
    reputation: 76,
    status: 'active'
  },
  {
    id: 11,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11',
    fullName: 'Lý Thị Mai',
    cccd: '001234567900',
    phone: '0911122233',
    email: 'lythimai@example.com',
    dob: '30/10/1997',
    events: 2,
    rating: 3.7,
    reputation: 60,
    status: 'inactive'
  },
  {
    id: 12,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=12',
    fullName: 'Ngô Quang Nam',
    cccd: '001234567901',
    phone: '0922233344',
    email: 'ngoquangnam@example.com',
    dob: '14/04/1987',
    events: 14,
    rating: 4.7,
    reputation: 93,
    status: 'active'
  },
  {
    id: 13,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=13',
    fullName: 'Tạ Thị Quyên',
    cccd: '001234567902',
    phone: '0933344455',
    email: 'tathiquyen@example.com',
    dob: '27/08/1993',
    events: 10,
    rating: 4.4,
    reputation: 86,
    status: 'active'
  },
  {
    id: 14,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=14',
    fullName: 'Trương Minh Khoa',
    cccd: '001234567903',
    phone: '0944455566',
    email: 'truongminhkhoa@example.com',
    dob: '16/12/1992',
    events: 1,
    rating: 3.6,
    reputation: 58,
    status: 'locked'
  },
  {
    id: 15,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=15',
    fullName: 'Nguyễn Thị Oanh',
    cccd: '001234567904',
    phone: '0955566677',
    email: 'nguyenthioanh@example.com',
    dob: '08/03/1998',
    events: 13,
    rating: 4.9,
    reputation: 97,
    status: 'active'
  }
];

export default function VolunteersList(props: Props) {
  const [users, setUsers] = useState(mockUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLockUser, setSelectedLockUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [openLockModal, setOpenLockModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    fullName: '',
    cccd: '',
    phone: '',
    email: '',
    password: '',
    dob: '',
    address: ''
  });
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dobFrom, setDobFrom] = useState('');
  const [dobTo, setDobTo] = useState('');
  const [sortField, setSortField] = useState('none');
  const [sortOrder, setSortOrder] = useState('desc');
  const pageSize = 10;
  const filteredUsers = useMemo(() => {
    const parseDob = (dob: string) => {
      const [day, month, year] = dob.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const fromDate = dobFrom ? new Date(dobFrom) : null;
    const toDate = dobTo ? new Date(dobTo) : null;

    let result = users.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      switch (searchField) {
        case 'id':
          return String(user.id).includes(query);
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

    if (statusFilter !== 'all') {
      result = result.filter((user) => user.status === statusFilter);
    }

    if (fromDate || toDate) {
      result = result.filter((user) => {
        const userDate = parseDob(user.dob);
        if (fromDate && userDate < fromDate) return false;
        if (toDate && userDate > toDate) return false;
        return true;
      });
    }

    if (sortField !== 'none') {
      result = [...result].sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'rating') return (a.rating - b.rating) * order;
        if (sortField === 'reputation')
          return (a.reputation - b.reputation) * order;
        if (sortField === 'events') return (a.events - b.events) * order;
        return 0;
      });
    }

    return result;
  }, [
    users,
    searchField,
    searchQuery,
    statusFilter,
    dobFrom,
    dobTo,
    sortField,
    sortOrder
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleView = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setOpenDetailModal(true);
    }
  };

  const handleLock = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedLockUser(user);
      setOpenLockModal(true);
    }
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

  const handleAddVolunteer = () => {
    if (
      !newVolunteer.fullName ||
      !newVolunteer.cccd ||
      !newVolunteer.phone ||
      !newVolunteer.email ||
      !newVolunteer.password
    ) {
      return;
    }

    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      fullName: newVolunteer.fullName,
      cccd: newVolunteer.cccd,
      phone: newVolunteer.phone,
      email: newVolunteer.email,
      dob: newVolunteer.dob || '01/01/2000',
      events: 0,
      rating: 0,
      reputation: 0,
      status: 'active' as const
    };

    setUsers((prev) => [...prev, newUser]);
    setNewVolunteer({
      fullName: '',
      cccd: '',
      phone: '',
      email: '',
      password: '',
      dob: '',
      address: ''
    });
    setOpenAddModal(false);
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

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Quản Lý Tình Nguyện Viên"
      description="Quản lý danh sách tình nguyện viên"
    >
      <div className="w-full">
        <div className="sticky top-0 z-20 -mx-1 mb-4 bg-white/90 px-1 py-3 backdrop-blur dark:bg-zinc-950/90">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:flex-1 md:items-center">
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
              onClick={() => setOpenAddModal(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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

            <div className="flex flex-col gap-3 md:flex-row">
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
                  <SelectItem value="rating">Rating TB</SelectItem>
                  <SelectItem value="reputation">Điểm uy tín</SelectItem>
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
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead className="min-w-[150px]">Họ và tên</TableHead>
                  <TableHead className="min-w-[130px]">CCCD</TableHead>
                  <TableHead className="min-w-[120px]">Số điện thoại</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="w-[100px]">Ngày sinh</TableHead>
                  <TableHead className="w-[120px] text-center whitespace-nowrap">
                    Số sự kiện
                  </TableHead>
                  <TableHead className="w-[100px] text-center">
                    Rating TB
                  </TableHead>
                  <TableHead className="w-[110px] text-center">
                    Điểm uy tín
                  </TableHead>
                  <TableHead className="w-[110px]">Trạng thái</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
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
                    <TableCell className="text-center">{user.events}</TableCell>
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
          <DialogContent className="max-w-2xl bg-white dark:bg-white">
            <DialogHeader>
              <DialogTitle>Chi tiết thông tin tình nguyện viên</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về tình nguyện viên được chọn
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={selectedUser.avatar}
                      alt={selectedUser.fullName}
                    />
                    <AvatarFallback>
                      {selectedUser.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {selectedUser.fullName}
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Sự kiện
                    </p>
                    <p className="text-2xl font-bold">{selectedUser.events}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Đánh giá
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">
                        {selectedUser.rating.toFixed(1)}
                      </span>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Uy tín
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedUser.reputation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Lock Confirmation Modal */}
        <Dialog open={openLockModal} onOpenChange={setOpenLockModal}>
          <DialogContent className="max-w-md bg-white dark:bg-white">
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

        {/* Add Volunteer Modal */}
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogContent className="max-w-2xl bg-white dark:bg-white">
            <DialogHeader>
              <DialogTitle className="text-blue-600">
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
                        Số CCCD <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập 12 số CCCD"
                        value={newVolunteer.cccd}
                        onChange={(e) =>
                          setNewVolunteer({
                            ...newVolunteer,
                            cccd: e.target.value
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

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      value={newVolunteer.password}
                      onChange={(e) =>
                        setNewVolunteer({
                          ...newVolunteer,
                          password: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Information Section */}
              <div>
                <h3 className="font-semibold text-sm text-yellow-600 dark:text-zinc-300 mb-3">
                  Thông tin bổ sung
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Ngày sinh
                    </label>
                    <Input
                      type="date"
                      value={newVolunteer.dob}
                      onChange={(e) =>
                        setNewVolunteer({
                          ...newVolunteer,
                          dob: e.target.value
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Địa chỉ
                    </label>
                    <Input
                      placeholder="Nhập địa chỉ đầy đủ"
                      value={newVolunteer.address}
                      onChange={(e) =>
                        setNewVolunteer({
                          ...newVolunteer,
                          address: e.target.value
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
                  variant="outline"
                  onClick={() => setOpenAddModal(false)}
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
