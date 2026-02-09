'use client';

import { useState } from 'react';
import { MdSearch, MdAdd, MdEmail, MdPhone, MdChevronRight } from 'react-icons/md';
import { cn } from '@/lib/utils';

// API Response Structure
interface HostData {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  address: string;
  district: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE';
  eventCount: number;
  totalHours: number;
  avatar?: string;
  createdAt: string;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface HostListResponse {
  content: HostData[];
  page: PageInfo;
}

// Mock Data
const mockHostData: HostListResponse = {
  content: [
    {
      id: '1',
      email: 'buiminhhtuan@email.com',
      phone: '0990123456',
      fullName: 'Bùi Minh Tuấn',
      address: 'Quận Nam Từ Liêm',
      district: 'Nam Từ Liêm',
      city: 'Hà Nội',
      status: 'ACTIVE',
      eventCount: 26,
      totalHours: 1680,
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'dangvanlong@email.com',
      phone: '0978901234',
      fullName: 'Đặng Văn Long',
      address: 'Quận Tây Hồ',
      district: 'Tây Hồ',
      city: 'Hà Nội',
      status: 'ACTIVE',
      eventCount: 28,
      totalHours: 1820,
      createdAt: '2026-01-10T09:20:00Z'
    },
    {
      id: '3',
      email: 'hoangducthang@email.com',
      phone: '0956789012',
      fullName: 'Hoàng Đức Thắng',
      address: 'Quận Cầu Giấy',
      district: 'Cầu Giấy',
      city: 'Hà Nội',
      status: 'ACTIVE',
      eventCount: 22,
      totalHours: 1560,
      createdAt: '2026-01-08T14:15:00Z'
    },
    {
      id: '4',
      email: 'leminhcuong@email.com',
      phone: '0934567890',
      fullName: 'Lê Minh Cường',
      address: 'Quận Đống Đa',
      district: 'Đống Đa',
      city: 'Hà Nội',
      status: 'ACTIVE',
      eventCount: 31,
      totalHours: 2100,
      createdAt: '2026-01-05T11:45:00Z'
    },
    {
      id: '5',
      email: 'nguyenvanan@email.com',
      phone: '0912345678',
      fullName: 'Nguyễn Văn An',
      address: 'Quận Ba Đình',
      district: 'Ba Đình',
      city: 'Hà Nội',
      status: 'ACTIVE',
      eventCount: 24,
      totalHours: 1450,
      createdAt: '2026-01-03T08:30:00Z'
    },
    {
      id: '6',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '7',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '8',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '9',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '10',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '11',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '12',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    },
    {
      id: '13',
      email: 'phamthuha@email.com',
      phone: '0945678901',
      fullName: 'Phạm Thu Hà',
      address: 'Quận Hai Bà Trưng',
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      status: 'INACTIVE',
      eventCount: 15,
      totalHours: 720,
      createdAt: '2025-12-20T16:20:00Z'
    }
  ],
  page: {
    size: 9,
    number: 0,
    totalElements: 13,
    totalPages: 2
  }
};

const statusConfig = {
  ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  INACTIVE: { label: 'Ngưng hoạt động', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (index: number) => {
  const colors = [
    'bg-[#42A5F5]',
    'bg-[#64B5F6]',
    'bg-[#90CAF9]',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500'
  ];
  return colors[index % colors.length];
};

export default function HostManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [data] = useState<HostListResponse>(mockHostData);

  const pageSize = data.page.size;

  // Filter hosts
  let filteredHosts = data.content.filter(host => {
    const matchSearch = host.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       host.phone?.includes(searchQuery);
    const matchStatus = filterStatus === 'all' || host.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Sort hosts
  filteredHosts = [...filteredHosts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.fullName.localeCompare(b.fullName, 'vi');
      case 'name-desc':
        return b.fullName.localeCompare(a.fullName, 'vi');
      case 'events-desc':
        return b.eventCount - a.eventCount;
      case 'hours-desc':
        return b.totalHours - a.totalHours;
      default:
        return 0;
    }
  });

  // Calculate pagination info based on filtered results
  const totalPages = Math.ceil(filteredHosts.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageHosts = filteredHosts.slice(startIndex, endIndex);

  // Reset to first page when search/filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white min-w-[180px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white min-w-[160px]"
          >
            <option value="name-asc">Sắp xếp: Tên (A-Z)</option>
            <option value="name-desc">Sắp xếp: Tên (Z-A)</option>
            <option value="events-desc">Sự kiện (Nhiều nhất)</option>
            <option value="hours-desc">Giờ (Nhiều nhất)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  HOST
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  LIÊN HỆ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  TRẠNG THÁI
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  SỰ KIỆN
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  GIỜ PHỤC VỤ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentPageHosts.map((host, index) => {
                const globalIndex = startIndex + index;
                return (
                <tr 
                  key={host.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Host Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                          getAvatarColor(globalIndex)
                        )}>
                          {getInitials(host.fullName)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {host.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {host.address}, {host.city}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MdEmail className="text-base text-gray-400" />
                        <span>{host.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MdPhone className="text-base text-gray-400" />
                        <span>{host.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                      statusConfig[host.status].color
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {statusConfig[host.status].label}
                    </span>
                  </td>

                  {/* Events Count */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F2FD] dark:bg-[#42A5F5]/20 text-[#42A5F5] font-bold">
                      {host.eventCount}
                    </span>
                  </td>

                  {/* Hours */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold text-sm">
                      {host.totalHours}h
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <MdChevronRight className="text-xl text-gray-400" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(endIndex, filteredHosts.length)}</span>{' '}
            trong tổng số <span className="font-medium">{filteredHosts.length}</span> host
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                currentPage === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  i === currentPage
                    ? 'bg-[#42A5F5] text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                currentPage === totalPages - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
