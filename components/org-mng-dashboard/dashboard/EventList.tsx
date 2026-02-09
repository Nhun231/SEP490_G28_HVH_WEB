'use client';

import Link from 'next/link';
import { MdCalendarToday, MdLocationOn, MdPerson } from 'react-icons/md';
import { cn } from '@/lib/utils';

interface Event {
    id: string;
    title: string;
    host: string;
    date: string;
    location: string;
    volunteerCount: number;
    status: 'pending' | 'approved' | 'rejected' | 'recruiting' | 'upcoming' | 'on-going' | 'finished';
}

interface EventListProps {
    events?: Event[];
    title?: string;
    showStatus?: boolean;
}

const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Hoạt động dọn dẹp công viên Vĩnh Hằng',
        host: 'Nguyễn Văn An',
        date: '2024-02-15',
        location: 'TP. Hồ Chí Minh',
        volunteerCount: 50,
        status: 'pending'
    },
    {
        id: '2',
        title: 'Chiến dịch trồng cây xanh "Thông tương lai"',
        host: 'Lê Minh Cường',
        date: '2024-02-18',
        location: 'Hà Nội',
        volunteerCount: 100,
        status: 'pending'
    },
    {
        id: '3',
        title: 'Trao yêu thương cho trẻ em miền núi',
        host: 'Trần Thị Bích',
        date: '2024-02-20',
        location: 'Lào Cai',
        volunteerCount: 30,
        status: 'pending'
    },
    {
        id: '4',
        title: 'Chiến dịch làm sạch bãi biển Sầm Sơn',
        host: 'Nguyễn Văn An',
        date: '2024-02-22',
        location: 'Thanh Hóa',
        volunteerCount: 75,
        status: 'pending'
    },
    {
        id: '5',
        title: 'Xây nhà thương cho người nghèo',
        host: 'Hoàng Văn Đức',
        date: '2024-02-25',
        location: 'Đồng Nai',
        volunteerCount: 40,
        status: 'pending'
    },
];

const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    recruiting: { label: 'Đang tuyển', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    upcoming: { label: 'Sắp diễn ra', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    'on-going': { label: 'Đang diễn ra', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    finished: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function EventList({
    events = mockEvents,
    title = 'Sự kiện chờ phê duyệt',
    showStatus = true
}: EventListProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <Link
                    href="/org-mng-dashboard/pending-approval"
                    className="text-sm text-[#42A5F5] hover:text-[#64B5F6] font-medium transition-colors"
                >
                    Xem tất cả →
                </Link>
            </div>

            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    {event.title}
                                </h4>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <MdPerson className="text-sm flex-shrink-0" />
                                        <span className="truncate">Host: {event.host}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <MdCalendarToday className="text-sm flex-shrink-0" />
                                        <span>{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <MdLocationOn className="text-sm flex-shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>
                            </div>
                            {showStatus && (
                                <span className={cn(
                                    'text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap',
                                    statusConfig[event.status].color
                                )}>
                                    {statusConfig[event.status].label}
                                </span>
                            )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {event.volunteerCount} tình nguyện viên
                            </span>
                            <button className="text-xs text-[#42A5F5] hover:text-[#64B5F6] font-medium transition-colors">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
