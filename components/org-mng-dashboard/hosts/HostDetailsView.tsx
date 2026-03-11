'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdPerson, MdCreditCard, MdLock, MdLockOpen, MdFilterList } from 'react-icons/md';
import { cn } from '@/lib/utils';

interface HostDetailsViewProps {
    hostId: string;
}

interface HostData {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    cid: string;
    address: string;
    detailAddress: string;
    avatar?: string;
    status: string;
    createdAt: string;
}

interface Event {
    id: string;
    title: string;
    date: string;
    duration: string;
    status: 'completed' | 'ongoing' | 'upcoming';
}

export default function HostDetailsView({ hostId }: HostDetailsViewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [hostData, setHostData] = useState<HostData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAccountLocked, setIsAccountLocked] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [durationFilter, setDurationFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing' | 'upcoming'>('all');

    // Mock data - replace with API call
    const mockEvents: Event[] = [
        {
            id: '1',
            title: 'Chăm sóc, người cao tuổi và không nơi nương tựa',
            date: '04/03/2024',
            duration: '3h',
            status: 'completed'
        },
        {
            id: '2',
            title: 'Quy tụ em nhỏ, dí chứ lớn sinh vật cao',
            date: '04/03/2024',
            duration: '3h',
            status: 'completed'
        },
        {
            id: '3',
            title: 'Làm sạch môi trường phố Ủ Bộn',
            date: '06/03/2024',
            duration: '3h',
            status: 'ongoing'
        },
        {
            id: '4',
            title: 'Hỗ trợ phục, giảa cây người nghèo',
            date: '06/03/2024',
            duration: '3h',
            status: 'upcoming'
        },
        {
            id: '5',
            title: 'Tổ chức lớp học tiếng Anh - miễn phí',
            date: '04/05/2024',
            duration: '3h',
            status: 'upcoming'
        }
    ];

    useEffect(() => {
        // Mock loading data
        setTimeout(() => {
            setHostData({
                id: hostId,
                fullName: 'Bùi Minh Tuấn',
                email: 'buiminhtuan@gmail.com',
                phone: '0985123456',
                dob: '04/03/1990',
                cid: '001234567890',
                address: 'Cầu Giấy, Hà Nội',
                detailAddress: 'Số 123 Đường Xuân Thủy',
                status: 'Đang hoạt động',
                createdAt: '01/01/2024',
                avatar: undefined
            });
            setIsLoading(false);
        }, 500);
    }, [hostId]);

    const getStatusBadge = (status: Event['status']) => {
        switch (status) {
            case 'completed':
                return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">Đã diễn ra</span>;
            case 'ongoing':
                return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-[#42A5F5] text-xs rounded-full">Đang diễn ra</span>;
            case 'upcoming':
                return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">Sắp diễn ra</span>;
        }
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        setDurationFilter('all');
        setStatusFilter('all');
    };

    const parseDateDDMMYYYY = (dateStr: string) => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return null;
    };

    const parseDuration = (duration: string) => {
        const hours = parseInt(duration.replace('h', ''));
        return hours;
    };

    const filteredEvents = mockEvents.filter(event => {
        // Search filter
        if (!event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Date range filter
        if (fromDate || toDate) {
            const eventDate = parseDateDDMMYYYY(event.date);
            if (eventDate) {
                if (fromDate) {
                    const from = parseDateDDMMYYYY(fromDate);
                    if (from && eventDate < from) return false;
                }
                if (toDate) {
                    const to = parseDateDDMMYYYY(toDate);
                    if (to && eventDate > to) return false;
                }
            }
        }

        // Duration filter
        if (durationFilter !== 'all') {
            const hours = parseDuration(event.duration);
            if (durationFilter === '1-2' && (hours < 1 || hours > 2)) return false;
            if (durationFilter === '3-4' && (hours < 3 || hours > 4)) return false;
            if (durationFilter === '5+' && hours < 5) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && event.status !== statusFilter) {
            return false;
        }

        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42A5F5]"></div>
            </div>
        );
    }

    if (!hostData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Không tìm thấy thông tin host</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#42A5F5] transition-colors mb-4"
                >
                    <MdArrowBack className="text-xl" />
                    <span className="font-medium">Thông tin Host</span>
                </button>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết Host</h1>
                    <button
                        onClick={() => setIsAccountLocked(!isAccountLocked)}
                        className={cn(
                            "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                            isAccountLocked
                                ? "bg-[#42A5F5] hover:bg-[#64B5F6] text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        )}
                    >
                        {isAccountLocked ? (
                            <>
                                <MdLockOpen className="w-5 h-5" />
                                Mở khóa tài khoản
                            </>
                        ) : (
                            <>
                                <MdLock className="w-5 h-5" />
                                Khóa tài khoản
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Avatar & Name Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#42A5F5] to-[#64B5F6] flex items-center justify-center text-white text-3xl font-bold mb-4">
                                {hostData.avatar ? (
                                    <img src={hostData.avatar} alt={hostData.fullName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    hostData.fullName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{hostData.fullName}</h2>
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-full">
                                {hostData.status}
                            </span>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-x-12 gap-y-6 w-full">

                            <div className="flex items-start gap-3">
                                <MdEmail className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                    <p className="text-base text-gray-900 dark:text-white break-all font-medium">{hostData.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MdPhone className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{hostData.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MdLocationOn className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{hostData.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MdCalendarToday className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ngày sinh</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{hostData.dob}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MdCreditCard className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Số CCCD/CMND</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{hostData.cid}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MdPerson className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ngày tạo tài khoản</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium">{hostData.createdAt}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 md:col-span-2">
                                <MdLocationOn className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
                                <div className="flex-1 w-full min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ chi tiết</p>
                                    <p className="text-base text-gray-900 dark:text-white font-medium break-all leading-relaxed">
                                        {hostData.detailAddress}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Events History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lịch sử hoạt động gần đây</h3>

                            {/* Search and Filter Button */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex-1">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm hoạt động..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium",
                                        showFilter
                                            ? "bg-[#42A5F5] text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                    )}
                                >
                                    <MdFilterList className="text-xl" />
                                    <span>Lọc</span>
                                </button>
                            </div>

                            {/* Filter Panel */}
                            {showFilter && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                                    {/* Date Range */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Khoảng thời gian</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Từ ngày</label>
                                                <input
                                                    type="text"
                                                    placeholder="dd/mm/yyyy"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Đến ngày</label>
                                                <input
                                                    type="text"
                                                    placeholder="dd/mm/yyyy"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration Filter */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời gian diễn ra</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => setDurationFilter('all')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    durationFilter === 'all'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                Tất cả
                                            </button>
                                            <button
                                                onClick={() => setDurationFilter('1-2')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    durationFilter === '1-2'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                1-2 giờ
                                            </button>
                                            <button
                                                onClick={() => setDurationFilter('3-4')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    durationFilter === '3-4'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                3-4 giờ
                                            </button>
                                            <button
                                                onClick={() => setDurationFilter('5+')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    durationFilter === '5+'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                5+ giờ
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái sự kiện</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => setStatusFilter('all')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    statusFilter === 'all'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                Tất cả
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('completed')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    statusFilter === 'completed'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                Đã diễn ra
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('ongoing')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    statusFilter === 'ongoing'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                Đang diễn ra
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('upcoming')}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    statusFilter === 'upcoming'
                                                        ? "bg-[#42A5F5] text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                )}
                                            >
                                                Sắp diễn ra
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clear Filter Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-[#42A5F5] hover:text-[#64B5F6] font-medium"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Events List */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredEvents.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">Không tìm thấy hoạt động nào</p>
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 group-hover:text-[#42A5F5] transition-colors">
                                                    {event.title}
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <MdCalendarToday className="text-sm" />
                                                        {event.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {event.duration}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(event.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Button */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <button className="w-full py-2.5 bg-[#42A5F5] hover:bg-[#64B5F6] text-white rounded-lg font-medium transition-colors">
                                Xem thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
