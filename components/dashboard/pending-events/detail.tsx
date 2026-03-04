/* eslint-disable @next/next/no-img-element */

'use client';

import DashboardLayout from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { User } from '@supabase/supabase-js';
import { Mail, Phone, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { IRoute } from '@/types/types';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  eventId: string;
  backBasePath?: string;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
  shellClassName?: string;
  pageDescription?: string;
  infoText?: string;
  showActions?: boolean;
  showApprovedActions?: boolean;
}

const mockPendingEvents = [
  {
    id: '1',
    eventName: 'Chương trình tình nguyện môi trường',
    organizer: 'Tổ chức Xanh Việt',
    hostName: 'Nguyễn Văn An',
    hostEmail: 'nguyenvanan@email.com',
    hostPhone: '0901234567',
    date: '15/03/2026',
    endDate: '15/03/2026',
    startTime: '08:00',
    endTime: '12:00',
    registrationDeadline: '12/03/2026',
    approvalMode: 'Manual',
    location: 'Công viên Tao Đàn, TPHCM',
    region: 'TPHCM / Quận 1 / Phường Bến Thành',
    volunteers: 45,
    expectedBeneficiaries: 200,
    serviceTarget: 'Môi trường',
    serviceField: 'Môi trường',
    checkinPointName: 'Cổng chính công viên',
    geofencingRadius: '500m',
    submittedDate: '10/02/2026',
    status: 'Chờ phê duyệt',
    description: 'Sự kiện tuyên truyền và dọn dẹp môi trường tại công viên.',
    images: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: '2',
    eventName: 'Hỗ trợ cộng đồng địa phương',
    organizer: 'Hội chữ Thập Đỏ',
    hostName: 'Trần Thị Bình',
    hostEmail: 'tranthibinh@email.com',
    hostPhone: '0912345678',
    date: '22/03/2026',
    endDate: '22/03/2026',
    startTime: '08:30',
    endTime: '13:00',
    registrationDeadline: '19/03/2026',
    approvalMode: 'Auto',
    location: 'Huyện Nhà Bè',
    region: 'TPHCM / Huyện Nhà Bè / Xã Phước Kiển',
    volunteers: 30,
    expectedBeneficiaries: 150,
    serviceTarget: 'Cộng đồng địa phương',
    serviceField: 'Xã hội',
    checkinPointName: 'UBND xã',
    geofencingRadius: '400m',
    submittedDate: '05/02/2026',
    status: 'Chờ phê duyệt',
    description: 'Chương trình hỗ trợ hộ gia đình khó khăn tại địa phương.',
    images: [
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: '3',
    eventName: 'Giáo dục cho trẻ em vùng cao',
    organizer: 'Quỹ Phúc Lợi Xã Hội',
    hostName: 'Lê Minh Khang',
    hostEmail: 'leminhkhang@email.com',
    hostPhone: '0987654321',
    date: '28/03/2026',
    endDate: '29/03/2026',
    startTime: '07:30',
    endTime: '15:30',
    registrationDeadline: '24/03/2026',
    approvalMode: 'Manual',
    location: 'Tỉnh Yên Bái',
    region: 'Yên Bái / Huyện Mù Cang Chải / Xã La Pán Tẩn',
    volunteers: 60,
    expectedBeneficiaries: 500,
    serviceTarget: 'Trẻ em vùng cao',
    serviceField: 'Giáo dục',
    checkinPointName: 'Trường tiểu học La Pán Tẩn',
    geofencingRadius: '600m',
    submittedDate: '01/02/2026',
    status: 'Chờ phê duyệt',
    description: 'Hoạt động hỗ trợ giáo dục cho trẻ em vùng cao.',
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: '4',
    eventName: 'Hiến máu nhân đạo mùa xuân',
    organizer: 'Hội chữ Thập Đỏ',
    hostName: 'Nguyễn Văn An',
    hostEmail: 'nguyenvanan@email.com',
    hostPhone: '0901234567',
    date: '05/01/2026',
    endDate: '05/01/2026',
    startTime: '07:30',
    endTime: '12:00',
    registrationDeadline: '02/01/2026',
    approvalMode: 'Manual',
    location: 'Quận Đống Đa, Hà Nội',
    region: 'Hà Nội / Quận Đống Đa / Phường Láng Thượng',
    volunteers: 80,
    expectedBeneficiaries: 300,
    serviceTarget: 'Cộng đồng',
    serviceField: 'Y tế',
    checkinPointName: 'Nhà văn hóa',
    geofencingRadius: '500m',
    submittedDate: '15/12/2025',
    status: 'Đang tuyển quân',
    description: 'Chương trình hiến máu nhân đạo phục vụ cộng đồng.',
    images: [
      '/img/about-us/full.jpg',
      '/img/about-us/scrappy.jpg',
      '/img/about-us/row-1-column-1.png'
    ]
  },
  {
    id: '5',
    eventName: 'Trồng cây gây rừng ven đô',
    organizer: 'Tổ chức Xanh Việt',
    hostName: 'Phạm Thu Hà',
    hostEmail: 'phamthuha@email.com',
    hostPhone: '0977001122',
    date: '10/02/2026',
    endDate: '10/02/2026',
    startTime: '08:00',
    endTime: '11:30',
    registrationDeadline: '07/02/2026',
    approvalMode: 'Auto',
    location: 'Sóc Sơn, Hà Nội',
    region: 'Hà Nội / Huyện Sóc Sơn / Xã Minh Phú',
    volunteers: 120,
    expectedBeneficiaries: 1000,
    serviceTarget: 'Môi trường',
    serviceField: 'Môi trường',
    checkinPointName: 'Cổng khu sinh thái',
    geofencingRadius: '600m',
    submittedDate: '20/12/2025',
    status: 'Đã đóng đơn',
    description: 'Hoạt động trồng cây và chăm sóc rừng ven đô.',
    images: [
      '/img/about-us/curious.webp',
      '/img/about-us/connect.webp',
      '/img/about-us/kid.webp'
    ]
  }
];

export default function PendingEventDetail({
  user,
  userDetails,
  eventId,
  backBasePath = '/dashboard/pending-events',
  routes,
  colorVariant,
  signInPath,
  shellClassName,
  pageDescription = 'Thông tin chi tiết sự kiện chờ phê duyệt',
  infoText = 'Thông tin chi tiết sự kiện chờ phê duyệt',
  showActions = true,
  showApprovedActions = false
}: Props) {
  const router = useRouter();
  const effectiveVariant = colorVariant ?? 'admin';
  const approveLabel =
    effectiveVariant === 'organizer' ? 'Chuyển phê duyệt' : 'Phê duyệt';
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const event = mockPendingEvents.find((item) => item.id === eventId);
  const canEditApprovedEvent =
    event?.status === 'Đang tuyển quân' || event?.status === 'Đã đóng đơn';

  const lifecycleStatusBadgeClassName: Partial<Record<string, string>> = {
    'Đang tuyển quân':
      'mt-1 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500',
    'Đã đóng đơn':
      'mt-1 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-zinc-900 transition-colors duration-150 hover:bg-yellow-300',
    'Đang diễn ra':
      'mt-1 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-green-500',
    'Đã kết thúc':
      'mt-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-500'
  };

  return (
    <>
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết sự kiện"
        description={pageDescription}
        routes={routes}
        colorVariant={colorVariant}
        signInPath={signInPath}
        shellClassName={shellClassName}
      >
        <div className="w-full">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mt-2 text-zinc-500">{infoText}</p>
            </div>
            <Button
              variant="outline"
              className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
              onClick={() => router.push(backBasePath)}
            >
              Quay lại
            </Button>
          </div>

          {!event ? (
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <p className="text-zinc-600">Không tìm thấy sự kiện.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                  Ảnh minh họa sự kiện
                </h2>
                <div className="mt-4">
                  <Carousel opts={{ align: 'start' }}>
                    <CarouselContent>
                      {event.images?.map((src, index) => (
                        <CarouselItem
                          key={`${event.id}-img-${index}`}
                          className="basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                          <button
                            type="button"
                            className="w-full"
                            onClick={() => setPreviewImage(src)}
                            aria-label={`Xem ảnh ${index + 1}`}
                          >
                            <div className="overflow-hidden rounded-lg border border-zinc-200">
                              <img
                                src={src}
                                alt={`${event.eventName} - ảnh ${index + 1}`}
                                className="h-56 w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                    Thông tin chung
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Tên sự kiện</p>
                      <p className="text-sm text-zinc-700">{event.eventName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Tổ chức</p>
                      <p className="text-sm text-zinc-700">{event.organizer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Chế độ duyệt</p>
                      <p className="text-sm text-zinc-700">
                        {event.approvalMode}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Trạng thái</p>
                      <Badge
                        className={
                          lifecycleStatusBadgeClassName[event.status] ??
                          'mt-1 border-zinc-200 bg-blue-50 text-blue-700'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Địa điểm</p>
                      <p className="text-sm text-zinc-700">{event.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Khu vực</p>
                      <p className="text-sm text-zinc-700">{event.region}</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                    Thời gian
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Ngày diễn ra</p>
                      <p className="text-sm text-zinc-700">{event.date}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Ngày kết thúc</p>
                      <p className="text-sm text-zinc-700">{event.endDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Giờ bắt đầu</p>
                      <p className="text-sm text-zinc-700">{event.startTime}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Giờ kết thúc</p>
                      <p className="text-sm text-zinc-700">{event.endTime}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Hạn đăng ký</p>
                      <p className="text-sm text-zinc-700">
                        {event.registrationDeadline}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Ngày nộp</p>
                      <p className="text-sm text-zinc-700">
                        {event.submittedDate}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                    Chỉ tiêu & lĩnh vực
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Tình nguyện viên</p>
                      <p className="text-sm text-zinc-700">
                        {event.volunteers}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">
                        Số đối tượng phục vụ
                      </p>
                      <p className="text-sm text-zinc-700">
                        {event.expectedBeneficiaries}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Đối tượng phục vụ</p>
                      <p className="text-sm text-zinc-700">
                        {event.serviceTarget}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">
                        Lĩnh vực hoạt động
                      </p>
                      <p className="text-sm text-zinc-700">
                        {event.serviceField}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                    Điểm danh
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Điểm check-in</p>
                      <p className="text-sm text-zinc-700">
                        {event.checkinPointName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Bán kính</p>
                      <p className="text-sm text-zinc-700">
                        {event.geofencingRadius}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                    Thông tin host
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto p-0 text-sm text-emerald-600 hover:bg-transparent hover:text-emerald-700"
                    onClick={() => {
                      // TODO: handle change host
                    }}
                  >
                    Thay đổi host
                  </Button>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                      <UserRound className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">Host</p>
                      <p className="truncate text-sm text-zinc-800">
                        {event.hostName ?? '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                      <Mail className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">Email liên hệ</p>
                      <p className="truncate text-sm text-zinc-800">
                        {event.hostEmail ?? '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                      <Phone className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">Số điện thoại</p>
                      <p className="truncate text-sm text-zinc-800">
                        {event.hostPhone ?? '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                  Mô tả chi tiết
                </h2>
                <p className="mt-3 text-sm text-zinc-700">
                  {event.description}
                </p>
              </Card>

              {showActions && (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      // TODO: handle reject
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      // TODO: handle approve
                    }}
                  >
                    {approveLabel}
                  </Button>
                </div>
              )}

              {showApprovedActions && canEditApprovedEvent && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      // TODO: handle cancel event
                    }}
                  >
                    Hủy sự kiện
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      // TODO: handle edit event
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={() => setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {previewImage && (
            <img
              src={previewImage}
              alt="Ảnh minh họa"
              className="h-auto w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
