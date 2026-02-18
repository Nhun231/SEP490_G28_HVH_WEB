'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
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
import { User } from '@supabase/supabase-js';
import { Plus, Star } from 'lucide-react';
import type { OrganizationItem } from '@/hooks/entity';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const mockOrganizations: OrganizationItem[] = [
  {
    id: 'org-01',
    name: 'Đoàn Thanh niên Thành phố Hồ Chí Minh',
    taxCode: '0312345678',
    location: 'Q.1, TPHCM',
    orgType: 'Nhóm xã hội',
    rating: 4.9,
    reviews: 134,
    volunteers: 15420,
    donations: 328450,
    imageUrl: 'https://picsum.photos/seed/org01/120/120',
    tags: [
      { label: 'Cộng đồng', variant: 'outline' },
      { label: 'Dự án giáo dục', variant: 'secondary' }
    ],
    status: 'Hoạt động'
  },
  {
    id: 'org-02',
    name: 'Hội Chữ thập đỏ Việt Nam',
    taxCode: '0319988776',
    location: 'Q.3, TPHCM',
    orgType: 'Thành lập trong khu phố',
    rating: 5.0,
    reviews: 98,
    volunteers: 23600,
    donations: 456780,
    imageUrl: 'https://picsum.photos/seed/org02/120/120',
    tags: [
      { label: 'Y tế', variant: 'outline' },
      { label: 'Cứu trợ khẩn cấp', variant: 'secondary' }
    ],
    status: 'Hoạt động'
  },
  {
    id: 'org-03',
    name: 'Quỹ Bảo trợ Trẻ em Sài Gòn',
    taxCode: '0312233445',
    location: 'Q.7, TPHCM',
    orgType: 'Thành lập trong trường học',
    rating: 4.8,
    reviews: 76,
    volunteers: 6805,
    donations: 124002,
    imageUrl: 'https://picsum.photos/seed/org03/120/120',
    tags: [
      { label: 'Trẻ em', variant: 'outline' },
      { label: 'Phúc lợi xã hội', variant: 'secondary' }
    ],
    status: 'Hoạt động'
  },
  {
    id: 'org-04',
    name: 'Tổ chức Môi trường xanh khu phố 3',
    taxCode: '0315566778',
    location: 'Q.10, TPHCM',
    orgType: 'Nhóm xã hội',
    rating: 4.3,
    reviews: 45,
    volunteers: 1180,
    donations: 34560,
    imageUrl: 'https://picsum.photos/seed/org04/120/120',
    tags: [
      { label: 'Môi trường', variant: 'outline' },
      { label: 'Tình nguyện', variant: 'secondary' }
    ],
    status: 'Ngừng hoạt động'
  },
  {
    id: 'org-05',
    name: 'Tổ chức Hỗ trợ quốc tế VietAid',
    taxCode: '0316677889',
    location: 'Q.2, TPHCM',
    orgType: 'Thành lập trong khu phố',
    rating: 4.7,
    reviews: 112,
    volunteers: 12340,
    donations: 267890,
    imageUrl: 'https://picsum.photos/seed/org05/120/120',
    tags: [
      { label: 'Cứu trợ', variant: 'outline' },
      { label: 'Toàn cầu', variant: 'secondary' }
    ],
    status: 'Hoạt động'
  }
];

const statusBadgeClass = (status: OrganizationItem['status']) => {
  if (status === 'Hoạt động') {
    return 'border-green-200 bg-green-50 text-green-700';
  }
  return 'border-red-200 bg-red-50 text-red-700';
};

const renderStars = (rating: number) => {
  const fullStars = Math.round(rating);
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={`star-${index}`}
      className={`h-4 w-4 ${
        index < fullStars ? 'text-yellow-500' : 'text-zinc-300'
      }`}
      fill={index < fullStars ? 'currentColor' : 'none'}
    />
  ));
};

export default function OrganizationsPage({ user, userDetails }: Props) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'name' | 'taxCode'>('name');
  const [searchValue, setSearchValue] = useState('');

  const searchPlaceholders = {
    name: 'Tìm kiếm theo tên tổ chức...',
    taxCode: 'Tìm kiếm theo mã số thuế...'
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Quản lý tổ chức"
      description="Danh sách các tổ chức"
    >
      <div className="w-full">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Select
              value={searchType}
              onValueChange={(value) =>
                setSearchType(value as 'name' | 'taxCode')
              }
            >
              <SelectTrigger className="h-10 w-40 border-blue-200 bg-blue-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Tên tổ chức</SelectItem>
                <SelectItem value="taxCode">Mã số thuế</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={searchPlaceholders[searchType]}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-10 flex-1 border-blue-200 bg-blue-50"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Loại hình tổ chức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="gov">Nhà nước</SelectItem>
              <SelectItem value="ngo">Phi lợi nhuận</SelectItem>
              <SelectItem value="community">Cộng đồng</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Lĩnh vực hoạt động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="education">Giáo dục</SelectItem>
              <SelectItem value="health">Y tế</SelectItem>
              <SelectItem value="environment">Môi trường</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="hcm">TPHCM</SelectItem>
              <SelectItem value="hn">Hà Nội</SelectItem>
              <SelectItem value="dn">Đà Nẵng</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="paused">Tạm ngưng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-4">
          {mockOrganizations.map((org) => (
            <Card
              key={org.id}
              className="cursor-pointer border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800"
              onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
            >
              <div className="flex flex-wrap gap-4">
                <img
                  src={org.imageUrl}
                  alt={org.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-zinc-900">
                        {org.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                          {org.location}
                        </Badge>
                        <Badge className="border-violet-200 bg-violet-50 text-violet-700">
                          {org.orgType}
                        </Badge>
                        <Badge className={statusBadgeClass(org.status)}>
                          {org.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1 text-sm text-zinc-500">
                    <span>Mã số thuế: {org.taxCode}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(org.rating)}
                      <span className="ml-1 font-medium text-zinc-600">
                        {org.rating}
                      </span>
                      <span className="text-zinc-400">
                        ({org.reviews} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {org.tags.map((tag) => (
                      <Badge
                        key={`${org.id}-${tag.label}`}
                        className="border-slate-200 bg-slate-50 text-slate-600"
                        variant="outline"
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
                      <p className="text-xs text-zinc-500">Số thành viên</p>
                      <p className="mt-2 text-2xl font-bold text-green-700">
                        {org.volunteers.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
                      <p className="text-xs text-zinc-500">Số giờ uy tín</p>
                      <p className="mt-2 text-2xl font-bold text-blue-700">
                        {org.donations.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">Hiển thị 1-5 trên 20 tổ chức</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
