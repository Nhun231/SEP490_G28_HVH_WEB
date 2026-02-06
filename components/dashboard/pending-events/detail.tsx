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
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  eventId: string;
}

const mockPendingEvents = [
  {
    id: '1',
    eventName: 'Chương trình tình nguyện môi trường',
    organizer: 'Tổ chức Xanh Việt',
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
  }
];

export default function PendingEventDetail({
  user,
  userDetails,
  eventId
}: Props) {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const event = mockPendingEvents.find((item) => item.id === eventId);

  return (
    <>
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Chi tiết sự kiện"
        description="Thông tin chi tiết sự kiện chờ phê duyệt"
      >
        <div className="w-full">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mt-2 text-gray-600">
                Thông tin chi tiết sự kiện chờ phê duyệt
              </p>
            </div>
            <Button
              variant="outline"
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => router.push('/dashboard/pending-events')}
            >
              Quay lại
            </Button>
          </div>

          {!event ? (
            <Card className="border-zinc-200 bg-white p-6 dark:border-zinc-800">
              <p className="text-gray-600">Không tìm thấy sự kiện.</p>
            </Card>
          ) : (
            <Card className="border-zinc-200 p-6 dark:border-zinc-800">
              <div className="grid gap-6">
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-red-600">
                    Ảnh minh họa sự kiện
                  </p>
                  <div className="mt-3">
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
                              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
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
                </div>
                <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      Thông tin chung
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Tên sự kiện
                    </p>
                    <p className="mt-1 text-gray-700">{event.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Tổ chức</p>
                    <p className="mt-1 text-gray-700">{event.organizer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Chế độ duyệt
                    </p>
                    <p className="mt-1 text-gray-700">{event.approvalMode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Trạng thái
                    </p>
                    <Badge className="mt-1 border-zinc-200 bg-blue-50 text-blue-700 dark:border-zinc-800">
                      {event.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Địa điểm</p>
                    <p className="mt-1 text-gray-700">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Khu vực</p>
                    <p className="mt-1 text-gray-700">{event.region}</p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      Thời gian
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Ngày diễn ra
                    </p>
                    <p className="mt-1 text-gray-700">{event.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Ngày kết thúc
                    </p>
                    <p className="mt-1 text-gray-700">{event.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Giờ bắt đầu
                    </p>
                    <p className="mt-1 text-gray-700">{event.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Giờ kết thúc
                    </p>
                    <p className="mt-1 text-gray-700">{event.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Hạn đăng ký
                    </p>
                    <p className="mt-1 text-gray-700">
                      {event.registrationDeadline}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Ngày nộp</p>
                    <p className="mt-1 text-gray-700">{event.submittedDate}</p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      Chỉ tiêu & lĩnh vực
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Tình nguyện viên
                    </p>
                    <p className="mt-1 text-gray-700">{event.volunteers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Số đối tượng phục vụ
                    </p>
                    <p className="mt-1 text-gray-700">
                      {event.expectedBeneficiaries}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Đối tượng phục vụ
                    </p>
                    <p className="mt-1 text-gray-700">{event.serviceTarget}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Lĩnh vực hoạt động
                    </p>
                    <p className="mt-1 text-gray-700">{event.serviceField}</p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      Điểm danh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Điểm check-in
                    </p>
                    <p className="mt-1 text-gray-700">
                      {event.checkinPointName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Bán kính geofencing
                    </p>
                    <p className="mt-1 text-gray-700">
                      {event.geofencingRadius}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    Mô tả
                  </p>
                  <p className="mt-2 text-gray-700">{event.description}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // TODO: handle approve
                  }}
                >
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // TODO: handle reject
                  }}
                >
                  Từ chối
                </Button>
              </div>
            </Card>
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
