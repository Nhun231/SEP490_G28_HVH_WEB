/* eslint-disable @next/next/no-img-element */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Edit, Star, X } from 'lucide-react';
import type { OrganizationDetail } from '@/hooks/entity';

interface Props {
  orgId: string;
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const mockOrgDetail: OrganizationDetail = {
  id: 'org-01',
  name: 'Đoàn Thanh niên Thành phố Hồ Chí Minh',
  taxCode: '0312345678',
  location: 'Q.1, TPHCM',
  orgType: 'Nhóm xã hội',
  status: 'Hoạt động',
  rating: 4.9,
  reviews: 134,
  volunteers: 15420,
  donations: 328450,
  imageUrl: 'https://picsum.photos/seed/org01/200/200',
  introduction:
    'Đoàn Thanh niên Thành phố Hồ Chí Minh là một tổ chức lâu đời hỗ trợ các hoạt động xã hội tại Việt Nam. Hơn 30 năm nay, chúng tôi tập trung vào giáo dục, cải thiện điều kiện sống và các hoạt động tình nguyện để xây dựng cộng đồng tốt hơn.',
  applicationReason:
    'Chúng tôi muốn mở rộng các hoạt động tình nguyện và nâng cao chất lượng phục vụ cộng đồng. Thông qua nền tảng này, chúng tôi sẽ quản lý tốt hơn công việc tình nguyện của các thành viên.',
  basicInfo: {
    email: 'contact@doanthanhniensaigon.org.vn',
    address: 'Lầu 8, Phạo Chu Trinh, Phường Chân Lạn, Hà Nội',
    founded: 'Loại Nhà nước',
    taxCode: '0312345678',
    yearRegistered: '2020506061'
  },
  adminInfo: {
    name: 'Đoàn Bình An',
    position: 'Khác',
    phone: '0988123456',
    email: 'binhanthanhniensaigon@gmail.com',
    cccd: '001290906012'
  },
  registrationImages: [
    'https://picsum.photos/seed/org01-reg1/400/400',
    'https://picsum.photos/seed/org01-reg2/400/400',
    'https://picsum.photos/seed/org01-reg3/400/400',
    'https://picsum.photos/seed/org01-reg4/400/400'
  ],
  supportingDocuments: [
    'https://picsum.photos/seed/org01-doc1/400/400',
    'https://picsum.photos/seed/org01-doc2/400/400',
    'https://picsum.photos/seed/org01-doc3/400/400',
    'https://picsum.photos/seed/org01-doc4/400/400'
  ]
};

const statusBadgeClass = (status: OrganizationDetail['status']) => {
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

export default function OrganizationDetailPage({
  orgId,
  user,
  userDetails
}: Props) {
  const router = useRouter();
  const org = mockOrgDetail;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Chi tiết Tổ chức"
      description=""
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Chi tiết Tổ chức</span>
          </button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="mr-2 h-4 w-4" />
            Cập nhật
          </Button>
        </div>

        {/* Organization Header Card */}
        <Card className="mb-6 border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
            <div className="w-24 md:w-48 md:shrink-0 md:self-stretch">
              <img
                src={org.imageUrl}
                alt={org.name}
                className="h-24 w-24 rounded-xl object-cover md:h-full md:w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold leading-snug tracking-tight text-zinc-900 md:text-3xl">
                    {org.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className={statusBadgeClass(org.status)}>
                      {org.status}
                    </Badge>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                      {org.location}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {renderStars(org.rating)}
                <span className="ml-2 text-sm font-medium text-zinc-600">
                  {org.rating}
                </span>
                <span className="text-sm text-zinc-400">
                  ({org.reviews} đánh giá)
                </span>
              </div>
            </div>

            <div className="w-full md:w-[260px] md:shrink-0 md:border-l md:border-zinc-200 md:pl-6 md:flex md:flex-col md:justify-center">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1 md:gap-6">
                <div className="text-center md:text-left">
                  <p className="text-xs text-zinc-500 md:text-sm">
                    Số người ứng tuyển
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-none text-zinc-900 md:text-3xl">
                    {org.volunteers.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-zinc-500 md:text-sm">
                    Số giờ uy tín
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-none text-zinc-900 md:text-3xl">
                    {org.donations.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Basic Info and Admin Info */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card className="border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
              Thông tin cơ bản
            </h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Email tổ chức:</span>
                <span className="text-sm text-zinc-700">
                  {org.basicInfo.email}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Địa chỉ chi chức:</span>
                <span className="text-sm text-zinc-700">
                  {org.basicInfo.address}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">
                  Loại hình tổ chức:
                </span>
                <span className="text-sm text-zinc-700">
                  {org.basicInfo.founded}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Mã số thuế:</span>
                <span className="text-sm text-zinc-700">
                  {org.basicInfo.taxCode}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Năm đăng ký:</span>
                <span className="text-sm text-zinc-700">
                  {org.basicInfo.yearRegistered}
                </span>
              </div>
            </div>
          </Card>

          {/* Admin Info */}
          <Card className="border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
              Thông tin quản trị viên
            </h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">
                  Tên quản trị viên:
                </span>
                <span className="text-sm text-zinc-700">
                  {org.adminInfo.name}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Chức vụ:</span>
                <span className="text-sm text-zinc-700">
                  {org.adminInfo.position}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Số điện thoại:</span>
                <span className="text-sm text-zinc-700">
                  {org.adminInfo.phone}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">Email liên hệ:</span>
                <span className="text-sm text-zinc-700">
                  {org.adminInfo.email}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500">CCCD:</span>
                <span className="text-sm text-zinc-700">
                  {org.adminInfo.cccd}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Organization Introduction */}
        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
            Giới thiệu tổ chức
          </h2>
          <p className="mt-4 text-sm text-zinc-700 leading-relaxed">
            {org.introduction}
          </p>
        </Card>

        {/* Application Reason */}
        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
            Lý do ứng tuyển
          </h2>
          <p className="mt-4 text-sm text-zinc-700 leading-relaxed">
            {org.applicationReason}
          </p>
        </Card>

        {/* Registration Images */}
        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
            Mẫu đơn đăng ký tổ chức
          </h2>
          <div className="mt-4 relative">
            <Carousel className="w-full">
              <CarouselContent>
                {org.registrationImages.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/3 lg:basis-1/4"
                  >
                    <div
                      onClick={() => {
                        setSelectedImage(image);
                        setSelectedImages(org.registrationImages);
                      }}
                      className="h-48 cursor-pointer overflow-hidden rounded-lg bg-zinc-100 transition-transform hover:scale-105"
                    >
                      <img
                        src={image}
                        alt={`Registration document ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </div>
        </Card>

        {/* Supporting Documents */}
        <Card className="border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
            Tài liệu hỗ trợ
          </h2>
          <div className="mt-4 relative">
            <Carousel className="w-full">
              <CarouselContent>
                {org.supportingDocuments.map((doc, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/3 lg:basis-1/4"
                  >
                    <div
                      onClick={() => {
                        setSelectedImage(doc);
                        setSelectedImages(org.supportingDocuments);
                      }}
                      className="h-48 cursor-pointer overflow-hidden rounded-lg bg-zinc-100 transition-transform hover:scale-105"
                    >
                      <img
                        src={doc}
                        alt={`Supporting document ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </div>
        </Card>

        {/* Image Zoom Dialog */}
        <Dialog
          open={selectedImage !== null}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent
            className="w-screen h-screen max-w-none bg-transparent p-0 border-none flex items-center justify-center cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage && (
                <>
                  <img
                    src={selectedImage}
                    alt="Zoomed document"
                    className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain"
                  />
                  <DialogClose className="absolute -right-4 -top-4 rounded-full bg-white p-2 text-black hover:bg-gray-200">
                    <X className="h-6 w-6" />
                  </DialogClose>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
