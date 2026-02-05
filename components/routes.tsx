// Auth Imports
import { IRoute } from '@/types/types';
import {
  HiOutlineHome,
  HiOutlineCpuChip,
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineCog8Tooth,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar
} from 'react-icons/hi2';
import { Settings } from 'lucide-react';

export const routes: IRoute[] = [
  {
    name: 'Bảng điều khiển',
    path: '/dashboard/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Chat AI',
    path: '/dashboard/ai-chat',
    icon: (
      <HiOutlineCpuChip className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Quản lý người dùng',
    path: '#',
    icon: (
      <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: true,
    items: [
      {
        name: 'Danh sách tình nguyện viên',
        path: '/dashboard/volunteers-list',
        collapse: false
      },
      {
        name: 'Danh sách người tổ chức',
        path: '/dashboard/organizers-list',
        collapse: false
      }
    ]
  },
  {
    name: 'Chờ phê duyệt',
    path: '#',
    icon: (
      <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: true,
    items: [
      {
        name: 'Sự kiện chờ phê duyệt',
        path: '/dashboard/pending-approval?tab=events',
        collapse: false
      },
      {
        name: 'Tài khoản chờ phê duyệt',
        path: '/dashboard/pending-approval?tab=accounts',
        collapse: false
      },
      {
        name: 'Tổ chức chờ phê duyệt',
        path: '/dashboard/pending-approval?tab=organizations',
        collapse: false
      }
    ]
  },
  {
    name: 'Cấu hình sự kiện',
    path: '/dashboard/event-settings',
    icon: <Settings className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Cài đặt hồ sơ',
    path: '/dashboard/settings',
    icon: (
      <HiOutlineCog8Tooth className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Trợ lý AI',
    path: '/dashboard/ai-assistant',
    icon: <HiOutlineUser className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true
  },

  {
    name: 'Trang giới thiệu',
    path: '/home',
    icon: (
      <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: true
  }
];
