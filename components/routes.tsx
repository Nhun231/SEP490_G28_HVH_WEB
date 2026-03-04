// Auth Imports
import { IRoute } from '@/types/types';
import { Building, CircleCheckBig, Loader, Settings } from 'lucide-react';
import {
  HiOutlineCpuChip,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Bảng điều khiển',
    path: '/dashboard/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
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
    name: 'Quản lý tổ chức',
    path: '/dashboard/organizations',
    icon: <Building className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
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
        path: '/dashboard/pending-events',
        collapse: false
      },
      {
        name: 'Tổ chức chờ phê duyệt',
        path: '/dashboard/pending-orgs',
        collapse: false
      },
      {
        name: 'Tài khoản chờ phê duyệt',
        path: '/dashboard/pending-accounts',
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
    icon: <HiOutlineUser className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Trang giới thiệu',
    path: '/about-us',
    icon: (
      <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  }
];

export const organizerRoutes: IRoute[] = [
  {
    name: 'Bảng điều khiển',
    path: '/organizer/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    invisible: true
  },
  {
    name: 'Sự kiện chờ phê duyệt',
    path: '/organizer/pending-events',
    icon: <Loader className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Sự kiện đã phê duyệt',
    path: '/organizer/approved-events',
    icon: (
      <CircleCheckBig className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  }
];
