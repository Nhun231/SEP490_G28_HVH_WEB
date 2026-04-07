'use client';
import dynamic from 'next/dynamic';
const MapSection = dynamic(
  () =>
    import('./MapSection') as Promise<{
      default: React.ComponentType<{
        lat: number;
        lng: number;
        popupText: string;
      }>;
    }>,
  { ssr: false }
);
import ReverseGeocode from './ReverseGeocode';
import { getFullSupabaseImageUrl } from '@/utils/helpers';
/* eslint-disable @next/next/no-img-element */

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EEventStatus, EVENT_STATUS_LABELS } from '@/constants/event-status';
import { getBadgeClassNameByStatus } from '@/constants/event-badge-status';
import { EServedTarget, SERVED_TARGET_LABELS } from '@/constants/served-target';
import {
  EServingPlaceType,
  SERVING_PLACE_TYPE_LABELS
} from '@/constants/serving-place-type';
import type {
  EventDetailsResponseForManager,
  EventDetailsResponseForSystemAdmin
} from '@/hooks/dto';
import { useViewHostList } from '@/hooks/features/uc065-view-host-list/useViewHostList';
import { useAssignHost } from '@/hooks/features/uc081-assign-host-to-event/useAssignHost';
import { useRejectEventByOrgManager } from '@/hooks/features/uc080-approve-reject-event-by-org-manager/useReject';
import type { IRoute } from '@/types/types';
import { User } from '@supabase/supabase-js';
import { AlertCircle, Mail, Phone, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useApproveEventByOrgManager } from '@/hooks/features/uc080-approve-reject-event-by-org-manager/useApprove';
// No data fetching here; handled by container

const isHeicImageUrl = (src: string) => /\.(heic|heif)(\?|$)/i.test(src);
const isHeicMimeType = (value: string | null | undefined) =>
  !!value && /heic|heif/i.test(value);

function EventImage({
  src,
  alt,
  className,
  onClick,
  interactive = true
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const convertedObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (convertedObjectUrlRef.current) {
      URL.revokeObjectURL(convertedObjectUrlRef.current);
      convertedObjectUrlRef.current = null;
    }

    setDisplaySrc(src);

    const convertHeicToJpeg = async () => {
      try {
        const { default: heic2any } = await import('heic2any');
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || blob.type;
        const shouldConvert =
          isHeicImageUrl(src) ||
          isHeicMimeType(contentType) ||
          isHeicMimeType(blob.type);

        if (!shouldConvert) {
          if (!cancelled) {
            setDisplaySrc(src);
          }
          return;
        }

        const converted = await heic2any({
          blob,
          toType: 'image/jpeg',
          quality: 0.92
        });
        const convertedBlob = Array.isArray(converted)
          ? converted[0]
          : converted;
        const objectUrl = URL.createObjectURL(convertedBlob as Blob);
        convertedObjectUrlRef.current = objectUrl;

        if (!cancelled) {
          setDisplaySrc(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setDisplaySrc(src);
        }
      }
    };

    convertHeicToJpeg();

    return () => {
      cancelled = true;
      if (convertedObjectUrlRef.current) {
        URL.revokeObjectURL(convertedObjectUrlRef.current);
        convertedObjectUrlRef.current = null;
      }
    };
  }, [src]);

  const image = (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <img src={displaySrc} alt={alt} className={className} loading="lazy" />
    </div>
  );

  if (!interactive) {
    return image;
  }

  return (
    <button type="button" className="w-full" onClick={onClick} aria-label={alt}>
      {image}
    </button>
  );
}

type Props = {
  user: User | null | undefined;
  userDetails: Record<string, any> | null;
  externalData?:
    | EventDetailsResponseForManager
    | EventDetailsResponseForSystemAdmin
    | null;
  externalIsLoading?: boolean;
  externalError?: Error | null;
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
  onRefetchEventDetails?: () => Promise<unknown>;
};

type HostCandidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventCount: number;
};

type HostDisplayInfo = {
  name: string;
  email: string;
  phone: string;
};

export default function PendingEventDetail({
  user,
  userDetails,
  externalData,
  externalIsLoading,
  externalError,
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
  onRefetchEventDetails
}: Props) {
  const [hostDialogOpen, setHostDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostCandidate | null>(null);
  const [assignedHostOverride, setAssignedHostOverride] =
    useState<HostDisplayInfo | null>(null);
  const lastResolvedEventIdRef = useRef<string | null>(null);
  const handleRejectEvent = async () => {
    setRejectError('');
    setRejectSuccess('');
    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      if (isOrganizer) {
        await rejectEventByOrg({ reason: rejectReason });
      } else {
        await rejectEventByAdmin({ reason: rejectReason });
      }
      toast.success('Đã từ chối sự kiện thành công!');
      setRejectSuccess('Đã từ chối sự kiện thành công!');
      setRejectModalOpen(false);
      setRejectReason('');
      setTimeout(() => {
        router.push(backBasePath);
      }, 500);
    } catch (err: any) {
      setRejectError(err?.message || 'Có lỗi xảy ra khi từ chối.');
    }
  };

  const handleApproveEvent = async () => {
    try {
      if (isOrganizer) {
        await approveEventByOrg();
      } else {
        await approveEventByAdmin();
      }
      toast.success('Đã phê duyệt sự kiện thành công!');
      setApproveModalOpen(false);
      setTimeout(() => {
        router.push(backBasePath);
      }, 500);
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi phê duyệt.');
    }
  };
  const router = useRouter();
  const effectiveVariant = colorVariant ?? 'admin';
  const shouldShowHostInfo = showHostInfo ?? effectiveVariant === 'organizer';
  const approveLabel =
    effectiveVariant === 'organizer' ? 'Chuyển phê duyệt' : 'Phê duyệt';
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejectSuccess, setRejectSuccess] = useState('');
  const eventId = externalData?.id || '';
  useEffect(() => {
    if (!eventId) return;

    if (
      lastResolvedEventIdRef.current &&
      lastResolvedEventIdRef.current !== eventId
    ) {
      setAssignedHostOverride(null);
    }

    lastResolvedEventIdRef.current = eventId;
  }, [eventId]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const isAdmin = effectiveVariant === 'admin';
  const isOrganizer = effectiveVariant === 'organizer';
  const {
    useApproveEventByAdmin
  } = require('@/hooks/features/uc038-approve-reject-event-by-admin/useApprove');
  const {
    useRejectEventByAdmin
  } = require('@/hooks/features/uc038-approve-reject-event-by-admin/useReject');
  const { trigger: rejectEventByOrg, isMutating: isRejectingOrg } =
    useRejectEventByOrgManager({ id: eventId, baseUrl });
  const { trigger: approveEventByOrg, isMutating: isApprovingOrg } =
    useApproveEventByOrgManager({ id: eventId, baseUrl });
  const { trigger: rejectEventByAdmin, isMutating: isRejectingAdmin } =
    useRejectEventByAdmin({ id: eventId, baseUrl });
  const { trigger: approveEventByAdmin, isMutating: isApprovingAdmin } =
    useApproveEventByAdmin({ id: eventId, baseUrl });
  const { trigger: assignHost, isMutating: isAssigningHost } = useAssignHost({
    id: eventId,
    baseUrl
  });

  const {
    data: hostListData,
    isLoading: isHostListLoading,
    error: hostListError
  } = useViewHostList({
    pageNumber: 0,
    pageSize: 100,
    baseUrl,
    enabled: isOrganizer && hostDialogOpen
  });

  const availableHosts = useMemo(() => {
    return (hostListData?.content ?? []).map((host) => ({
      id: host.id,
      name: host.fullName?.trim() || 'Chưa cập nhật',
      email: host.email?.trim() || '-',
      phone: host.phone?.trim() || '-',
      eventCount: host.hostedEventCount ?? 0
    }));
  }, [hostListData?.content]);

  const handleAssignHost = async () => {
    if (!selectedHost?.id) {
      toast.error('Vui lòng chọn host hợp lệ.');
      return;
    }

    try {
      await assignHost({ hostId: selectedHost.id });
      setAssignedHostOverride({
        name: selectedHost.name,
        email: selectedHost.email,
        phone: selectedHost.phone
      });
      setConfirmDialogOpen(false);
      setSelectedHost(null);
      toast.success('Đã thay đổi host thành công!');
      if (onRefetchEventDetails) {
        await onRefetchEventDetails();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể thay đổi host.');
    }
  };
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
    // checkinPointName removed, use reverse geocode instead
    geofencingRadius: string;
    latCheckInLocation: number | null;
    lngCheckInLocation: number | null;
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

  function normalizeEvent(
    raw: EventDetailsResponseForManager | EventDetailsResponseForSystemAdmin
  ): EventData {
    // Type guard for SystemAdmin
    const isSystemAdmin = (e: any): e is EventDetailsResponseForSystemAdmin =>
      'imageUrls' in e && 'address' in e;
    if (isSystemAdmin(raw)) {
      const sessions = Array.isArray(raw.eventSessions)
        ? raw.eventSessions.map((s) => ({
            id: s.id,
            startDateTime:
              (s as any).startTime || (s as any).startDateTime || '',
            endDateTime: (s as any).endTime || (s as any).endDateTime || '',
            expectedVolAmount: (s as any).expectedVolAmount ?? 0,
            expectedSerAmount: (s as any).expectedSerAmount ?? 0
          }))
        : [];
      const firstSession = sessions[0];
      const lastSession = sessions[sessions.length - 1];
      return {
        id: raw.id,
        eventName: raw.name,
        organizer: (raw as any).orgName || '',
        approvalMode: '',
        status: raw.status,
        location: raw.address,
        region: '',
        date: fmtDate(raw.startDate ?? firstSession?.startDateTime),
        endDate: fmtDate(lastSession?.endDateTime),
        startTime: fmtTime(firstSession?.startDateTime),
        endTime: fmtTime(lastSession?.endDateTime),
        registrationDeadline: fmtDate((raw as any).recruitmentEndDate),
        submittedDate: fmtDate(raw.createdAt),
        volunteers: (raw as any).numberOfRegisteredVolunteers ?? 0,
        expectedBeneficiaries: (raw as any).numberOfJoinedVolunteers ?? 0,
        serviceTarget:
          SERVED_TARGET_LABELS[(raw as any).servedTarget] ||
          (raw as any).servedTarget ||
          '-',
        serviceField: (raw as any).activitySubDomain || '-',
        geofencingRadius: (raw as any).checkInAccuracyMeters?.toString() ?? '',
        latCheckInLocation: (raw as any).latCheckInLocation ?? null,
        lngCheckInLocation: (raw as any).lngCheckInLocation ?? null,
        hostName: (raw as any).hostName || '',
        hostEmail: (raw as any).hostEmail || '',
        hostPhone: (raw as any).hostPhone || '',
        description: raw.description || '',
        images: Array.isArray((raw as any).imageUrls)
          ? (raw as any).imageUrls
          : [],
        servingPlaceType:
          SERVING_PLACE_TYPE_LABELS[(raw as any).servingPlaceType] ||
          (raw as any).servingPlaceType ||
          '-',
        note: (raw as any).note || '',
        sessions
      };
    } else {
      // Manager type
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
        date: fmtDate(
          r.startDate ?? firstSession?.startDateTime ?? r.startedAt
        ),
        endDate: fmtDate(lastSession?.endDateTime ?? r.endDate ?? r.endedAt),
        startTime: fmtTime(
          firstSession?.startDateTime ?? r.startTime ?? r.startedAt
        ),
        endTime: fmtTime(lastSession?.endDateTime ?? r.endTime ?? r.endedAt),
        registrationDeadline: fmtDate(
          r.recruitmentEndDate ?? r.registrationDeadline
        ),
        submittedDate: fmtDate(r.createdAt ?? r.submittedDate),
        volunteers: sessions.reduce((sum, s) => sum + s.expectedVolAmount, 0),
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
        geofencingRadius: getStr(r.geofencingRadius, r.radius),
        latCheckInLocation:
          typeof r.latCheckInLocation === 'number'
            ? r.latCheckInLocation
            : r.latCheckInLocation !== undefined
              ? Number(r.latCheckInLocation)
              : null,
        lngCheckInLocation:
          typeof r.lngCheckInLocation === 'number'
            ? r.lngCheckInLocation
            : r.lngCheckInLocation !== undefined
              ? Number(r.lngCheckInLocation)
              : null,
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
    }
  }

  if (externalIsLoading) {
    return (
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
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-zinc-600">Đang tải dữ liệu...</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (externalError) {
    return (
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
          <Card className="border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="text-red-600">Không thể tải dữ liệu.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const event: EventData | null = externalData
    ? normalizeEvent(externalData)
    : null;

  const resolvedHostName = assignedHostOverride?.name ?? event?.hostName ?? '-';
  const resolvedHostEmail =
    assignedHostOverride?.email ?? event?.hostEmail ?? '-';
  const resolvedHostPhone =
    assignedHostOverride?.phone ?? event?.hostPhone ?? '-';

  const displayValue = (value: string) => {
    if (!value || value.trim() === '' || value === '-') {
      return 'Chưa cập nhật';
    }
    return value;
  };

  const hasImportantNote = (() => {
    const normalized = (event?.note ?? '').trim().toLowerCase();
    return Boolean(
      normalized &&
      normalized !== '-' &&
      normalized !== 'n/a' &&
      normalized !== 'na' &&
      normalized !== 'null' &&
      normalized !== 'undefined'
    );
  })();

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

  const canShowChangeHostButton = event
    ? [
        EEventStatus.RECRUITING,
        EEventStatus.UPCOMING,
        EEventStatus.ONGOING,
        'Đang tuyển quân',
        'Sắp diễn ra',
        'Đang diễn ra'
      ].includes(event.status as EEventStatus | string)
    : false;

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
            (() => {
              const showActionButtons =
                (isOrganizer && event.status === 'SUBMITTED') ||
                (isAdmin && event.status === 'APPROVED_BY_MNG');
              const isApproving = isOrganizer
                ? isApprovingOrg
                : isApprovingAdmin;
              const isRejecting = isOrganizer
                ? isRejectingOrg
                : isRejectingAdmin;
              return (
                <div className="grid gap-6">
                  <Card className="border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
                      Tóm tắt nhanh
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Tên sự kiện</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800">
                          {displayValue(event.eventName)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">
                          Thời gian diễn ra
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800">
                          {displayValue(event.date)} -{' '}
                          {displayValue(event.endDate)}
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
                          {event.images?.map((src, index) => {
                            const fullImageUrl = getFullSupabaseImageUrl(src);
                            return (
                              <CarouselItem
                                key={`${event.id}-img-${index}`}
                                className="basis-full sm:basis-1/2 lg:basis-1/3"
                              >
                                <EventImage
                                  src={fullImageUrl}
                                  alt={`${event.eventName} - ảnh ${index + 1}`}
                                  className="h-56 w-full object-cover"
                                  onClick={() => setPreviewImage(fullImageUrl)}
                                />
                              </CarouselItem>
                            );
                          })}
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
                          <p className="text-sm text-zinc-700">
                            {event.eventName}
                          </p>
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
                            className={getBadgeClassNameByStatus(event.status)}
                          >
                            {EVENT_STATUS_LABELS[
                              event.status as EEventStatus
                            ] || event.status}
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
                          <p className="text-sm text-zinc-700">
                            {event.endDate}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-500">Giờ bắt đầu</p>
                          <p className="text-sm text-zinc-700">
                            {event.startTime}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-500">Giờ kết thúc</p>
                          <p className="text-sm text-zinc-700">
                            {event.endTime}
                          </p>
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
                            {totalSessionVolunteers}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-500">
                            Tổng số đối tượng phục vụ dự kiến
                          </p>
                          <p className="text-sm text-zinc-700">
                            {totalSessionServedTargets}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-500">
                            Đối tượng phục vụ
                          </p>
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
                          {/* Địa chỉ từ reverse geocode */}
                          {typeof event.latCheckInLocation === 'number' &&
                          typeof event.lngCheckInLocation === 'number' ? (
                            <ReverseGeocode
                              lat={event.latCheckInLocation}
                              lng={event.lngCheckInLocation}
                            >
                              {(address) => (
                                <p className="text-sm text-zinc-700">
                                  {address ? address : 'Chưa cập nhật'}
                                </p>
                              )}
                            </ReverseGeocode>
                          ) : (
                            <p className="text-sm text-zinc-700">
                              Chưa cập nhật
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-500">Bán kính</p>
                          <p className="text-sm text-zinc-700">
                            {displayValue(event.geofencingRadius)} m
                          </p>
                        </div>
                      </div>
                      {/* Map hiển thị vị trí check-in */}
                      {typeof event.latCheckInLocation === 'number' &&
                        typeof event.lngCheckInLocation === 'number' && (
                          <div
                            className="mt-6 h-[300px] w-full rounded-lg overflow-hidden border border-zinc-200"
                            style={{ position: 'relative', zIndex: 0 }}
                          >
                            <MapSection
                              lat={event.latCheckInLocation}
                              lng={event.lngCheckInLocation}
                              popupText={event.location || ''}
                            />
                          </div>
                        )}
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
                                key={
                                  session.id || `${event.id}-session-${index}`
                                }
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
                        {canShowChangeHostButton && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto p-0 text-sm text-blue-600 hover:bg-transparent hover:text-blue-700"
                              onClick={() => setHostDialogOpen(true)}
                            >
                              Thay đổi host
                            </Button>
                            {/* Dialog chọn host mới */}
                            <Dialog
                              open={hostDialogOpen}
                              onOpenChange={setHostDialogOpen}
                            >
                              <DialogContent className="max-w-md bg-white">
                                <DialogHeader>
                                  <DialogTitle>Chọn host mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                  {isHostListLoading && (
                                    <p className="text-sm text-zinc-500">
                                      Đang tải danh sách host...
                                    </p>
                                  )}

                                  {hostListError && (
                                    <p className="text-sm text-rose-600">
                                      Không thể tải danh sách host.
                                    </p>
                                  )}

                                  {!isHostListLoading &&
                                    !hostListError &&
                                    availableHosts.length === 0 && (
                                      <p className="text-sm text-zinc-500">
                                        Không có host khả dụng.
                                      </p>
                                    )}

                                  {!isHostListLoading &&
                                    !hostListError &&
                                    availableHosts.map((host) => (
                                      <button
                                        key={host.id}
                                        className="w-full flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100 transition"
                                        onClick={() => {
                                          setSelectedHost(host);
                                          setHostDialogOpen(false);
                                          setTimeout(
                                            () => setConfirmDialogOpen(true),
                                            200
                                          );
                                        }}
                                      >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                                          {host.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                          <div className="font-semibold text-zinc-900 truncate">
                                            {host.name}
                                          </div>
                                          <div className="text-xs text-zinc-600 truncate">
                                            {host.email}
                                          </div>
                                          <div className="text-xs text-zinc-600">
                                            {host.phone}
                                          </div>
                                          <div className="text-xs text-zinc-500 mt-1">
                                            {host.eventCount} sự kiện
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Dialog xác nhận thay đổi host */}
                            <Dialog
                              open={confirmDialogOpen}
                              onOpenChange={setConfirmDialogOpen}
                            >
                              <DialogContent className="max-w-md bg-white">
                                <DialogHeader>
                                  <DialogTitle>
                                    Xác nhận thay đổi host
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="text-sm text-zinc-700 mb-4">
                                  Bạn có chắc chắn muốn thay đổi host từ:
                                  <br />
                                  <span className="font-semibold text-red-600">
                                    {displayValue(resolvedHostName)}
                                  </span>
                                  <span className="mx-2">→</span>
                                  <span className="font-semibold text-green-600">
                                    {selectedHost?.name}
                                  </span>
                                  <br />
                                  cho sự kiện:{' '}
                                  <span className="font-semibold">
                                    &quot;{event?.eventName}&quot;
                                  </span>
                                </div>
                                <DialogFooter className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="bg-red-500 border-none hover:bg-red-600 text-white hover:text-white"
                                    onClick={() => setConfirmDialogOpen(false)}
                                    disabled={isAssigningHost}
                                  >
                                    Hủy bỏ
                                  </Button>
                                  <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    disabled={isAssigningHost}
                                    onClick={handleAssignHost}
                                  >
                                    {isAssigningHost
                                      ? 'Đang thay đổi...'
                                      : 'Xác nhận thay đổi'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                            <UserRound className="h-4 w-4 text-zinc-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">Host</p>
                            <p className="truncate text-sm text-zinc-800">
                              {displayValue(resolvedHostName)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                            <Mail className="h-4 w-4 text-zinc-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">
                              Email liên hệ
                            </p>
                            <p className="truncate text-sm text-zinc-800">
                              {displayValue(resolvedHostEmail)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                            <Phone className="h-4 w-4 text-zinc-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">
                              Số điện thoại
                            </p>
                            <p className="truncate text-sm text-zinc-800">
                              {displayValue(resolvedHostPhone)}
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
                    {hasImportantNote && (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-amber-900">
                              Ghi chú quan trọng
                            </p>
                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-amber-950">
                              {event.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {showActions && showActionButtons && (
                    <>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() => setRejectModalOpen(true)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => setApproveModalOpen(true)}
                        >
                          {approveLabel}
                        </Button>
                      </div>
                      {/* Modal xác nhận phê duyệt */}
                      <Dialog
                        open={approveModalOpen}
                        onOpenChange={setApproveModalOpen}
                      >
                        <DialogContent className="bg-white max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Xác nhận phê duyệt sự kiện
                            </DialogTitle>
                          </DialogHeader>
                          <p className="mt-2 text-sm text-zinc-700">
                            {isOrganizer
                              ? 'Bạn có chắc chắn muốn chuyển phê duyệt dự kiện cho quản trị viên?'
                              : 'Bạn có chắc chắn muốn phê duyệt sự kiện này?'}
                          </p>
                          <DialogFooter className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              className="bg-zinc-200 text-zinc-700 border-none hover:bg-zinc-300"
                              onClick={() => setApproveModalOpen(false)}
                              disabled={isApproving}
                            >
                              Hủy
                            </Button>
                            <Button
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              disabled={isApproving}
                              onClick={handleApproveEvent}
                            >
                              {isOrganizer
                                ? 'Xác nhận chuyển phê duyệt'
                                : 'Xác nhận phê duyệt'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {/* Modal nhập lý do từ chối */}
                      <Dialog
                        open={rejectModalOpen}
                        onOpenChange={setRejectModalOpen}
                      >
                        <DialogContent className="bg-white max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Nhập lý do từ chối sự kiện
                            </DialogTitle>
                          </DialogHeader>
                          <Input
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            disabled={isRejecting}
                          />
                          {rejectError && (
                            <p className="text-red-600 text-sm mt-2">
                              {rejectError}
                            </p>
                          )}
                          {rejectSuccess && (
                            <p className="text-green-600 text-sm mt-2">
                              {rejectSuccess}
                            </p>
                          )}
                          <DialogFooter className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              className="bg-zinc-200 text-zinc-700 border-none hover:bg-zinc-300"
                              onClick={() => setRejectModalOpen(false)}
                              disabled={isRejecting}
                            >
                              Hủy
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-700"
                              disabled={isRejecting || !rejectReason.trim()}
                              onClick={handleRejectEvent}
                            >
                              Xác nhận từ chối
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {showApprovedActions && canEditApprovedEvent && (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => {}}
                      >
                        Hủy sự kiện
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </DashboardLayout>
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={() => setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {previewImage && (
            <EventImage
              src={previewImage}
              alt="Ảnh minh họa"
              className="h-auto max-h-[85vh] w-auto max-w-[90vw] rounded-md object-contain"
              interactive={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal nhập lý do từ chối */}
      {/* Modal nhập lý do từ chối phải nằm trong IIFE để dùng được isRejecting */}
    </>
  );
}
