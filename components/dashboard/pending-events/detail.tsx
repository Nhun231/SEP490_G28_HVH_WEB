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
import type { EventDetailsResponseForManager } from '@/hooks/dto';
import { EEventStatus, EVENT_STATUS_LABELS } from '@/constants/event-status';
import { EServedTarget, SERVED_TARGET_LABELS } from '@/constants/served-target';
import {
  EServingPlaceType,
  SERVING_PLACE_TYPE_LABELS
} from '@/constants/serving-place-type';

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
  showHostInfo?: boolean;
  externalData?: EventDetailsResponseForManager | null;
  externalIsLoading?: boolean;
  externalError?: Error | null;
}
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
  showApprovedActions = false,
  showHostInfo,
  externalData,
  externalIsLoading,
  externalError
}: Props) {
  const router = useRouter();
  const effectiveVariant = colorVariant ?? 'admin';
  const shouldShowHostInfo = showHostInfo ?? effectiveVariant === 'organizer';
  const approveLabel =
    effectiveVariant === 'organizer' ? 'Chuyển phê duyệt' : 'Phê duyệt';
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  interface EventData {
    id: string;
    eventName: string;
    organizer: string;
    approvalMode: string;
    status: string;
    location: string;
    region: string;
    date: string;
    endDate: string;
    startTime: string;
    endTime: string;
    registrationDeadline: string;
    submittedDate: string;
    volunteers: number;
    expectedBeneficiaries: number;
    serviceTarget: string;
    serviceField: string;
    checkinPointName: string;
    geofencingRadius: string;
    hostName: string;
    hostEmail: string;
    hostPhone: string;
    description: string;
    images: string[];
    servingPlaceType: string;
    note: string;
    sessions: Array<{
      id: string;
      startDateTime: string;
      endDateTime: string;
      expectedVolAmount: number;
      expectedSerAmount: number;
    }>;
  }

  const getStr = (...vals: unknown[]): string => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '-';
  };

  const fmtDate = (v: unknown): string => {
    if (typeof v !== 'string' || !v.trim()) return '-';
    const t = v.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) return t;
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const fmtTime = (v: unknown): string => {
    if (typeof v !== 'string' || !v.trim()) return '-';
    const t = v.trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return t.slice(0, 5);
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return '-';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const normalizeEvent = (raw: EventDetailsResponseForManager): EventData => {
    const r = raw as Record<string, unknown>;
    const sessionsRaw = Array.isArray(r.eventSessions)
      ? (r.eventSessions as Array<Record<string, unknown>>)
      : [];
    const sessions = sessionsRaw.map((s) => ({
      id: getStr(s.id),
      startDateTime: getStr(s.startDateTime),
      endDateTime: getStr(s.endDateTime),
      expectedVolAmount:
        typeof s.expectedVolAmount === 'number'
          ? s.expectedVolAmount
          : Number(s.expectedVolAmount ?? 0),
      expectedSerAmount:
        typeof s.expectedSerAmount === 'number'
          ? s.expectedSerAmount
          : Number(s.expectedSerAmount ?? 0)
    }));

    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];

    return {
      id: getStr(r.id),
      eventName: getStr(r.name, r.eventName, r.title),
      organizer: getStr(r.organizationName, r.organizer),
      approvalMode: getStr(r.approvalMode, r.registrationMethod),
      status: getStr(r.status, r.eventStatus),
      location: getStr(r.location, r.address),
      region: getStr(r.region, r.ward, r.district),
      date: fmtDate(r.startDate ?? firstSession?.startDateTime ?? r.startedAt),
      endDate: fmtDate(lastSession?.endDateTime ?? r.endDate ?? r.endedAt),
      startTime: fmtTime(
        firstSession?.startDateTime ?? r.startTime ?? r.startedAt
      ),
      endTime: fmtTime(lastSession?.endDateTime ?? r.endTime ?? r.endedAt),
      registrationDeadline: fmtDate(
        r.recruitmentEndDate ?? r.registrationDeadline
      ),
      submittedDate: fmtDate(r.createdAt ?? r.submittedDate),
      volunteers:
        typeof r.maxVolunteers === 'number'
          ? r.maxVolunteers
          : sessions.reduce((sum, s) => sum + s.expectedVolAmount, 0),
      expectedBeneficiaries: sessions.reduce(
        (sum, s) => sum + s.expectedSerAmount,
        0
      ),
      serviceTarget: (() => {
        const val = getStr(
          r.servedTarget,
          r.serviceTarget,
          r.targetBeneficiary
        );
        return SERVED_TARGET_LABELS[val as EServedTarget] || val || '-';
      })(),
      serviceField: getStr(
        r.activitySubDomain,
        r.serviceField,
        r.activityDomain
      ),
      checkinPointName: getStr(r.checkinPointName, r.checkInPoint),
      geofencingRadius: getStr(r.geofencingRadius, r.radius),
      hostName: getStr(r.hostName, r.hostFullName),
      hostEmail: getStr(r.hostEmail),
      hostPhone: getStr(r.hostPhone, r.hostPhoneNumber),
      description: getStr(r.description),
      images: Array.isArray(r.images)
        ? (r.images as string[])
        : Array.isArray(r.imageUrls)
          ? (r.imageUrls as string[])
          : [],
      servingPlaceType: (() => {
        const val = getStr(r.servingPlaceType);
        return (
          SERVING_PLACE_TYPE_LABELS[val as EServingPlaceType] || val || '-'
        );
      })(),
      note: getStr(r.note),
      sessions
    };
  };

  const event: EventData | null = externalData
    ? normalizeEvent(externalData)
    : null;
  const displayValue = (value: string) => {
    if (!value || value.trim() === '' || value === '-') {
      return 'Chưa cập nhật';
    }
    return value;
  };

  const totalSessionCount = event?.sessions.length ?? 0;
  const totalSessionVolunteers =
    event?.sessions.reduce(
      (sum, session) => sum + session.expectedVolAmount,
      0
    ) ?? 0;
  const totalSessionServedTargets =
    event?.sessions.reduce(
      (sum, session) => sum + session.expectedSerAmount,
      0
    ) ?? 0;

  const canEditApprovedEvent = event
    ? ['Đang tuyển quân', 'Đã đóng đơn', 'RECRUITING', 'CLOSED'].includes(
        event.status
      )
    : false;

  const lifecycleStatusBadgeClassName: Partial<Record<string, string>> = {
    'Đang tuyển quân':
      'mt-1 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500',
    RECRUITING:
      'mt-1 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500',
    'Đã đóng đơn':
      'mt-1 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-zinc-900 transition-colors duration-150 hover:bg-yellow-300',
    FINISHED:
      'mt-1 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-zinc-900 transition-colors duration-150 hover:bg-yellow-300',
    'Đang diễn ra':
      'mt-1 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-green-500',
    ONGOING:
      'mt-1 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-green-500',
    'Đã kết thúc':
      'mt-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-500',
    ENDED:
      'mt-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-500',
    CANCELLED:
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

          {externalIsLoading ? (
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <p className="text-zinc-600">Đang tải thông tin sự kiện...</p>
            </Card>
          ) : externalError ? (
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <p className="text-red-600">Không thể tải thông tin sự kiện.</p>
            </Card>
          ) : !event ? (
            <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
              <p className="text-zinc-600">Không tìm thấy sự kiện.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                  Tóm tắt nhanh
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Trạng thái</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {EVENT_STATUS_LABELS[event.status as EEventStatus] ||
                        event.status}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Thời gian diễn ra</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {displayValue(event.date)} - {displayValue(event.endDate)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Tổng số phiên</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {totalSessionCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">
                      Tổng số tình nguyện viên dự kiến
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {totalSessionVolunteers}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">
                      Tổng số đối tượng phục vụ dự kiến
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {totalSessionServedTargets}
                    </p>
                  </div>
                </div>
              </Card>

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
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.organizer)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Chế độ duyệt</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.approvalMode)}
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
                        {EVENT_STATUS_LABELS[event.status as EEventStatus] ||
                          event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Khu vực</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.location)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Nơi phục vụ</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.servingPlaceType)}
                      </p>
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
                        {displayValue(event.registrationDeadline)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Ngày nộp</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.submittedDate)}
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
                      <p className="text-sm text-zinc-500">
                        Tổng số tình nguyện viên dự kiến
                      </p>
                      <p className="text-sm text-zinc-700">
                        {event.volunteers}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">
                        Tổng số đối tượng phục vụ dự kiến
                      </p>
                      <p className="text-sm text-zinc-700">
                        {event.expectedBeneficiaries}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Đối tượng phục vụ</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.serviceTarget)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">
                        Lĩnh vực hoạt động
                      </p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.serviceField)}
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
                        {displayValue(event.checkinPointName)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Bán kính</p>
                      <p className="text-sm text-zinc-700">
                        {displayValue(event.geofencingRadius)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                  Lịch phiên hoạt động
                </h2>
                {event.sessions.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-600">
                    Chưa có thông tin phiên hoạt động.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
                    <table className="min-w-full divide-y divide-zinc-200">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Phiên
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Ngày tổ chức
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Giờ bắt đầu
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Giờ kết thúc
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Tình nguyện viên dự kiến
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Đối tượng phục vụ dự kiến
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white">
                        {event.sessions.map((session, index) => (
                          <tr
                            key={session.id || `${event.id}-session-${index}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-zinc-800">
                              Phiên {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-700">
                              {fmtDate(session.startDateTime)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-700">
                              {fmtTime(session.startDateTime)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-700">
                              {fmtTime(session.endDateTime)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-700">
                              {session.expectedVolAmount}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-700">
                              {session.expectedSerAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-zinc-50">
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-3 text-sm font-semibold text-zinc-800"
                          >
                            Tổng
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-zinc-800">
                            {totalSessionVolunteers}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-zinc-800">
                            {totalSessionServedTargets}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Card>

              {shouldShowHostInfo && (
                <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                      Thông tin host
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-sm text-blue-600 hover:bg-transparent hover:text-blue-700"
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
                          {displayValue(event.hostName)}
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
                          {displayValue(event.hostEmail)}
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
                          {displayValue(event.hostPhone)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                  Mô tả chi tiết
                </h2>
                <p className="mt-3 text-sm text-zinc-700">
                  {displayValue(event.description)}
                </p>
                {event.note !== '-' && (
                  <>
                    <p className="mt-4 text-sm font-medium text-zinc-800">
                      Ghi chú
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">{event.note}</p>
                  </>
                )}
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
