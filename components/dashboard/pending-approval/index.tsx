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
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// Mock data for events pending approval
const mockEventsPending = [
  {
    id: 1,
    eventName: 'Chương trình tình nguyện môi trường',
    organizer: 'Tổ chức Xanh Việt',
    date: '15/03/2026',
    location: 'Công viên Tao Đàn, TPHCM',
    volunteers: 45,
    submittedDate: '10/02/2026'
  },
  {
    id: 2,
    eventName: 'Hỗ trợ cộng đồng địa phương',
    organizer: 'Hội chữ Thập Đỏ',
    date: '22/03/2026',
    location: 'Huyện Nhà Bè',
    volunteers: 30,
    submittedDate: '05/02/2026'
  },
  {
    id: 3,
    eventName: 'Giáo dục cho trẻ em vùng cao',
    organizer: 'Quỹ Phúc Lợi Xã Hội',
    date: '28/03/2026',
    location: 'Tỉnh Yên Bái',
    volunteers: 60,
    submittedDate: '01/02/2026'
  }
];

// Mock data for accounts pending approval
const mockAccountsPending = [
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=101',
    fullName: 'Trần Thị Bích Nghi',
    cccd: '201234567890',
    phone: '0987654321',
    email: 'bichnghi@example.com',
    dob: '20/08/1995',
    type: 'Tình nguyện viên',
    submittedDate: '04/02/2026'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=102',
    fullName: 'Lê Hoàng Minh',
    cccd: '202234567890',
    phone: '0976543210',
    email: 'hoangminh@example.com',
    dob: '15/12/1992',
    type: 'Người tổ chức',
    submittedDate: '03/02/2026'
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=103',
    fullName: 'Phạm Xuân Hùng',
    cccd: '203234567890',
    phone: '0965432109',
    email: 'xuanhung@example.com',
    dob: '10/07/1998',
    type: 'Tình nguyện viên',
    submittedDate: '02/02/2026'
  }
];

// Mock data for organizations pending approval
const mockOrganizationsPending = [
  {
    id: 1,
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=OrgA',
    orgName: 'Tổ chức Cộng Đồng Tương Lai',
    taxId: '0123456789',
    phone: '0288123456',
    email: 'contact@communityfuture.org',
    address: '123 Đường Nguyễn Huệ, Quận 1, TPHCM',
    submittedDate: '05/02/2026',
    description: 'Tổ chức hỗ trợ phát triển cộng đồng bền vững'
  },
  {
    id: 2,
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=OrgB',
    orgName: 'Quỹ Tương Lai Xanh',
    taxId: '0234567890',
    phone: '0288234567',
    email: 'info@greenfuture.org',
    address: '456 Đường Lê Lợi, Quận 1, TPHCM',
    submittedDate: '04/02/2026',
    description: 'Quỹ bảo vệ môi trường và phát triển bền vững'
  },
  {
    id: 3,
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=OrgC',
    orgName: 'Trung tâm Giáo dục Cộng Đồng',
    taxId: '0345678901',
    phone: '0288345678',
    email: 'support@communityed.org',
    address: '789 Đường Võ Văn Kiệt, Quận 1, TPHCM',
    submittedDate: '03/02/2026',
    description: 'Trung tâm cung cấp giáo dục và đào tạo cho cộng đồng'
  }
];

export default function PendingApproval({ user, userDetails }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as
    | 'events'
    | 'accounts'
    | 'organizations'
    | null;

  const [activeTab, setActiveTab] = useState<
    'events' | 'accounts' | 'organizations'
  >('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    'approve' | 'reject' | null
  >(null);

  // Update active tab from URL params
  useEffect(() => {
    if (
      tabParam &&
      ['events', 'accounts', 'organizations'].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Filter data based on search and filter
  const filteredData = useMemo(() => {
    let data: any[] = [];

    if (activeTab === 'events') {
      data = mockEventsPending;
    } else if (activeTab === 'accounts') {
      data = mockAccountsPending;
    } else {
      data = mockOrganizationsPending;
    }

    return data.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        (item.eventName?.toLowerCase() || '').includes(searchTerm) ||
        (item.fullName?.toLowerCase() || '').includes(searchTerm) ||
        (item.orgName?.toLowerCase() || '').includes(searchTerm) ||
        (item.email?.toLowerCase() || '').includes(searchTerm);

      return matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleApprove = (item: any) => {
    setSelectedItem(item);
    setConfirmAction('approve');
    setShowConfirmModal(true);
  };

  const handleReject = (item: any) => {
    setSelectedItem(item);
    setConfirmAction('reject');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    // TODO: Implement API call to approve/reject
    console.log(`${confirmAction} action for:`, selectedItem);
    setShowConfirmModal(false);
    setSelectedItem(null);
    setConfirmAction(null);
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Chờ phê duyệt</h1>
          <p className="mt-2 text-gray-600">
            Quản lý sự kiện, tài khoản và tổ chức chờ phê duyệt
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              router.push('?tab=events');
              setSearchQuery('');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'events'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sự kiện chờ phê duyệt
          </button>
          <button
            onClick={() => {
              router.push('?tab=accounts');
              setSearchQuery('');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tài khoản chờ phê duyệt
          </button>
          <button
            onClick={() => {
              router.push('?tab=organizations');
              setSearchQuery('');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'organizations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tổ chức chờ phê duyệt
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <Input
            placeholder={
              activeTab === 'events'
                ? 'Tìm kiếm sự kiện...'
                : activeTab === 'accounts'
                  ? 'Tìm kiếm tài khoản...'
                  : 'Tìm kiếm tổ chức...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-blue-200 bg-blue-50"
          />
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-gray-700">Tên sự kiện</TableHead>
                  <TableHead className="text-gray-700">Tổ chức</TableHead>
                  <TableHead className="text-gray-700">Ngày diễn ra</TableHead>
                  <TableHead className="text-gray-700">
                    Tình nguyện viên
                  </TableHead>
                  <TableHead className="text-gray-700">Ngày nộp</TableHead>
                  <TableHead className="text-center text-gray-700">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((event) => (
                    <TableRow
                      key={event.id}
                      className="border-b border-gray-200 hover:bg-blue-50"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {event.eventName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.organizer}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.date}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.volunteers}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.submittedDate}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(event)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(event)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(event)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-gray-700">Họ và tên</TableHead>
                  <TableHead className="text-gray-700">Email</TableHead>
                  <TableHead className="text-gray-700">Điện thoại</TableHead>
                  <TableHead className="text-gray-700">
                    Loại tài khoản
                  </TableHead>
                  <TableHead className="text-gray-700">Ngày nộp</TableHead>
                  <TableHead className="text-center text-gray-700">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((account) => (
                    <TableRow
                      key={account.id}
                      className="border-b border-gray-200 hover:bg-blue-50"
                    >
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={account.avatar} />
                          <AvatarFallback>
                            {account.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {account.fullName}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {account.email}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {account.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {account.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {account.submittedDate}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(account)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(account)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(account)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-gray-700">Tên tổ chức</TableHead>
                  <TableHead className="text-gray-700">Email</TableHead>
                  <TableHead className="text-gray-700">Điện thoại</TableHead>
                  <TableHead className="text-gray-700">Mã số thuế</TableHead>
                  <TableHead className="text-gray-700">Ngày nộp</TableHead>
                  <TableHead className="text-center text-gray-700">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((org) => (
                    <TableRow
                      key={org.id}
                      className="border-b border-gray-200 hover:bg-blue-50"
                    >
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={org.logo} />
                          <AvatarFallback>
                            {org.orgName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {org.orgName}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {org.email}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {org.phone}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {org.taxId}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {org.submittedDate}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(org)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(org)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(org)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600">
              Chi tiết thông tin
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {activeTab === 'events' && (
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Tên sự kiện
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.eventName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Tổ chức
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.organizer}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Địa điểm
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Ngày diễn ra
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Số lượng tình nguyện viên
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.volunteers}
                    </p>
                  </div>
                </div>
              )}
              {activeTab === 'accounts' && (
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Họ và tên
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Email
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Điện thoại
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Số CCCD
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.cccd}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Ngày sinh
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.dob}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Loại tài khoản
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.type}</p>
                  </div>
                </div>
              )}
              {activeTab === 'organizations' && (
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Tên tổ chức
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.orgName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Email
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Điện thoại
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Mã số thuế
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.taxId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Địa chỉ
                    </label>
                    <p className="mt-1 text-gray-700">{selectedItem.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Mô tả
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-600">
              Xác nhận thao tác
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              {confirmAction === 'approve'
                ? 'Bạn chắc chắn muốn duyệt phê duyệt mục này?'
                : 'Bạn chắc chắn muốn từ chối mục này?'}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Hủy
              </Button>
              <Button
                className={
                  confirmAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
                onClick={handleConfirmAction}
              >
                {confirmAction === 'approve' ? 'Duyệt' : 'Từ chối'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
