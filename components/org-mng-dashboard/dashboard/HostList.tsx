'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Host {
  id: string;
  name: string;
  email: string;
  eventCount: number;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface HostListProps {
  hosts?: Host[];
}

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
    'bg-blue-500',
    'bg-teal-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500'
  ];
  return colors[index % colors.length];
};

const mockHosts: Host[] = [
  { id: '1', name: 'Nguyễn Văn An', email: 'nguyenvanan@email.com', eventCount: 12, status: 'active' },
  { id: '2', name: 'Trần Thị Bích', email: 'tranthib@mail.com', eventCount: 8, status: 'active' },
  { id: '3', name: 'Lê Minh Cường', email: 'leminhcuong@mail.com', eventCount: 15, status: 'active' },
  { id: '4', name: 'Phạm Thu Dung', email: 'phamthudung@email.com', eventCount: 5, status: 'inactive' },
  { id: '5', name: 'Hoàng Văn Đức', email: 'hoangvanduc@email.com', eventCount: 10, status: 'active' },
];

export default function HostList({ hosts = mockHosts }: HostListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Danh sách Host</h3>
        <Link 
          href="/org-mng-dashboard/hosts"
          className="text-sm text-[#42A5F5] hover:text-[#64B5F6] font-medium transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="space-y-4">
        {hosts.map((host, index) => (
          <div 
            key={host.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                getAvatarColor(index)
              )}>
                {getInitials(host.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {host.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {host.email}
                </p>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {host.eventCount} sự kiện
              </p>
              <span className={cn(
                'inline-block text-xs px-2 py-0.5 rounded-full',
                host.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {host.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
