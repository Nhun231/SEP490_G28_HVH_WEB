'use client';

import DashboardLayout from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useCreateActivityDomain } from '@/hooks/features/uc060-create-activity-domain-activity-sub-domain/useCreateActivityDomain';
import { useUpdateActivityDomain } from '@/hooks/features/uc061-update-activity-domain-activity-sub-domain/useUpdateActivityDomain';
import { useGetListActivityDomain } from '@/hooks/features/uc063-view-activity-domain-activity-sub-domain/useGetListActivityDomain';
import { useHideUnhideActivityDomain } from '@/hooks/features/uc062-hide-unhide-activity-domain-activity-subbdomain/useHideUnhideActivityDomain';
import { useHideUnhideActivitySubdomain } from '@/hooks/features/uc062-hide-unhide-activity-domain-activity-subbdomain/useHideUnhideActivitySubdomain';
import type {
  UpdateActivityDomainRequest,
  UpdateActivitySubDomainRequest
} from '@/hooks/dto';
import type { ActivityDomain, ActivitySubDomain } from '@/hooks/entity';
import { User } from '@supabase/supabase-js';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function EventSettings(props: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { data: activityDomainData, mutate: refreshActivityDomains } =
    useGetListActivityDomain({
      pageNumber: 0,
      pageSize: 50,
      baseUrl: apiBaseUrl
    });
  const { trigger: createActivityDomain, isMutating: isCreating } =
    useCreateActivityDomain({
      baseUrl: apiBaseUrl
    });

  const fetchedActivityDomains = useMemo<
    (ActivityDomain & { max_service_time?: string })[]
  >(() => {
    return (activityDomainData?.content ?? []).map((domain, index) => ({
      id: domain.id ?? index + 1,
      name: domain.name,
      active: domain.active,
      activitySubDomains: (domain.activitySubDomainList ?? []).map((sd) => ({
        id: sd.id,
        name: sd.name,
        active: sd.active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      specialSessionMaxTime: domain.specialSessionMaxTime,
      createdAt: domain.createdAt ?? new Date().toISOString(),
      updatedAt: domain.updatedAt ?? new Date().toISOString(),
      max_service_time: domain.specialSessionMaxTime
        ? String(domain.specialSessionMaxTime)
        : ''
    }));
  }, [activityDomainData]);

  const [activityDomains, setActivityDomains] = useState<
    (ActivityDomain & { max_service_time?: string })[]
  >([]);
  const [selectedDomain, setSelectedDomain] = useState<
    (ActivityDomain & { max_service_time?: string }) | null
  >(null);
  const [openAddDomainModal, setOpenAddDomainModal] = useState(false);
  const [openDetailDomainModal, setOpenDetailDomainModal] = useState(false);
  const [openAddSubDomainModal, setOpenAddSubDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<
    (ActivityDomain & { max_service_time?: string }) | null
  >(null);
  const [newDomainName, setNewDomainName] = useState('');
  const [newSubDomainName, setNewSubDomainName] = useState('');
  const [draftSubDomainName, setDraftSubDomainName] = useState('');
  const [draftSubDomains, setDraftSubDomains] = useState<
    (Omit<ActivitySubDomain, 'id'> & { id: string | number })[]
  >([]);
  const [editingSubDomainId, setEditingSubDomainId] = useState<
    string | number | null
  >(null);
  const [editingSubDomainName, setEditingSubDomainName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    service_time: '',
    max_service_time: '4'
  });

  const [serviceTimeReason, setServiceTimeReason] = useState('');
  const [serviceTimeError, setServiceTimeError] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const { trigger: updateActivityDomain, isMutating: isUpdating } =
    useUpdateActivityDomain({
      id: String(editingDomain?.id ?? ''),
      baseUrl: apiBaseUrl
    });
  const isSubmitting = isCreating || isUpdating;

  // Confirmation modals
  const [openConfirmToggleDomain, setOpenConfirmToggleDomain] = useState(false);
  const [confirmingDomain, setConfirmingDomain] =
    useState<ActivityDomain | null>(null);
  const [confirmingSubDomain, setConfirmingSubDomain] =
    useState<ActivitySubDomain | null>(null);
  const [openConfirmDeleteDomain, setOpenConfirmDeleteDomain] = useState(false);
  const [openConfirmDeleteSubDomain, setOpenConfirmDeleteSubDomain] =
    useState(false);

  // Hooks for toggling, only called at top level
  const { trigger: triggerDomain, isMutating: isTogglingDomain } =
    useHideUnhideActivityDomain(
      confirmingDomain
        ? { id: String(confirmingDomain.id), baseUrl: apiBaseUrl }
        : { id: '', baseUrl: apiBaseUrl }
    );
  const { trigger: triggerSubDomain, isMutating: isTogglingSubDomain } =
    useHideUnhideActivitySubdomain(
      confirmingSubDomain
        ? { id: String(confirmingSubDomain.id), baseUrl: apiBaseUrl }
        : { id: '', baseUrl: apiBaseUrl }
    );

  useEffect(() => {
    setActivityDomains(fetchedActivityDomains);
    setSelectedDomain((prev) => {
      if (!prev) return null;
      return (
        fetchedActivityDomains.find((domain) => domain.id === prev.id) || null
      );
    });
  }, [fetchedActivityDomains]);

  const handleAddDomain = async () => {
    if (!formData.name.trim()) return;

    try {
      setCreateError(null);
      const payload = {
        name: formData.name,
        specialSessionMaxTime: Number(formData.max_service_time),
        activitySubDomain: draftSubDomains.map((d) => d.name)
      };

      await createActivityDomain(payload);
      await refreshActivityDomains();
      resetForm();
      setOpenDetailDomainModal(false);
      toast.success('Tạo lĩnh vực thành công.');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Lỗi khi tạo lĩnh vực, vui lòng thử lại';
      setCreateError(errorMessage);
      console.error('Failed to create activity domain:', error);
    }
  };

  const handleEditDomain = async () => {
    if (!editingDomain || !formData.name.trim()) return;

    try {
      setCreateError(null);
      const originalSubDomains = editingDomain.activitySubDomains ?? [];
      const currentSubDomains = draftSubDomains;

      // Normalize all IDs to strings for comparison
      const currentById = new Map<
        string,
        Omit<ActivitySubDomain, 'id'> & { id: string | number }
      >();

      currentSubDomains.forEach((subDomain) => {
        currentById.set(String(subDomain.id), subDomain);
      });

      const activitySubDomainUpdateRequests: UpdateActivitySubDomainRequest[] =
        [
          ...originalSubDomains.flatMap(
            (subDomain): UpdateActivitySubDomainRequest[] => {
              const current = currentById.get(String(subDomain.id));
              if (!current) {
                return [{ id: subDomain.id, action: 'DELETE' as const }];
              }
              if (current.name.trim() !== subDomain.name.trim()) {
                return [
                  {
                    id: subDomain.id,
                    name: current.name.trim(),
                    action: 'EDIT' as const
                  }
                ];
              }
              return [];
            }
          ),
          ...currentSubDomains.flatMap(
            (subDomain): UpdateActivitySubDomainRequest[] => {
              const idStr = String(subDomain.id);
              if (idStr.startsWith('draft-')) {
                const name = subDomain.name.trim();
                if (!name) return [];
                return [{ name, action: 'ADD' as const }];
              }
              return [];
            }
          )
        ];

      const payload: UpdateActivityDomainRequest = {
        name: formData.name,
        specialSessionMaxTime: Number(formData.max_service_time),
        activitySubDomainUpdateRequests: activitySubDomainUpdateRequests
      };

      await updateActivityDomain(payload);
      await refreshActivityDomains();
      resetForm();
      setOpenDetailDomainModal(false);
      toast.success('Cập nhật lĩnh vực thành công.');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Lỗi khi cập nhật lĩnh vực, vui lòng thử lại';
      setCreateError(errorMessage);
      console.error('Failed to update activity domain:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      service_time: '',
      max_service_time: '4'
    });
    setServiceTimeReason('');
    setServiceTimeError('');
    setCreateError(null);
    setEditingDomain(null);
    setDraftSubDomainName('');
    setDraftSubDomains([]);
    setEditingSubDomainId(null);
    setEditingSubDomainName('');
  };

  const handleServiceTimeBlur = () => {
    const value = formData.max_service_time.trim();
    if (!value) {
      setServiceTimeError('');
      return;
    }
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 4 || numValue > 12) {
      setServiceTimeError('Giá trị phải từ 4 đến 12 giờ');
    } else {
      setServiceTimeError('');
    }
  };

  const openEditModal = (
    domain: ActivityDomain & { max_service_time?: string }
  ) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      service_time: '',
      max_service_time: domain.max_service_time || ''
    });
    setServiceTimeReason('');
    setDraftSubDomainName('');
    setDraftSubDomains(
      domain.activitySubDomains?.map((sd) => ({
        ...sd,
        id: String(sd.id)
      })) ?? []
    );
    setOpenDetailDomainModal(true);
  };

  const handleAddDraftSubDomain = () => {
    if (!draftSubDomainName.trim()) return;
    const timestamp = Date.now();
    const newDraft: Omit<ActivitySubDomain, 'id'> & { id: string } = {
      id: `draft-${timestamp}`,
      name: draftSubDomainName.trim(),
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDraftSubDomains((prev) => [...prev, newDraft]);
    setDraftSubDomainName('');
  };

  const removeDraftSubDomain = (subDomainId: string | number) => {
    setDraftSubDomains((prev) => prev.filter((d) => d.id !== subDomainId));
  };

  const startEditSubDomain = (
    subDomain: Omit<ActivitySubDomain, 'id'> & { id: string | number }
  ) => {
    setEditingSubDomainId(subDomain.id);
    setEditingSubDomainName(subDomain.name);
  };

  const applyEditSubDomain = () => {
    if (!editingSubDomainId) return;
    const nextName = editingSubDomainName.trim();
    if (!nextName) {
      setEditingSubDomainId(null);
      setEditingSubDomainName('');
      return;
    }
    setDraftSubDomains((prev) =>
      prev.map((d) =>
        d.id === editingSubDomainId ? { ...d, name: nextName } : d
      )
    );
    setEditingSubDomainId(null);
    setEditingSubDomainName('');
  };

  const handleAddSubDomain = () => {
    if (!newSubDomainName.trim() || !selectedDomain) return;
    const newSubDomain: ActivitySubDomain = {
      id: Date.now(),
      name: newSubDomainName,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActivityDomains((prev) =>
      prev.map((domain) =>
        domain.id === selectedDomain.id
          ? {
              ...domain,
              activitySubDomains: [
                ...(domain.activitySubDomains ?? []),
                newSubDomain
              ]
            }
          : domain
      )
    );
    setSelectedDomain((prev) =>
      prev
        ? {
            ...prev,
            activitySubDomains: [
              ...(prev.activitySubDomains ?? []),
              newSubDomain
            ]
          }
        : prev
    );
    setNewSubDomainName('');
    setOpenAddSubDomainModal(false);
  };

  const handleSwitchDomain = (domain: ActivityDomain) => {
    setConfirmingDomain(domain);
    setConfirmingSubDomain(null);
    setOpenConfirmToggleDomain(true);
  };
  const handleSwitchSubDomain = (subDomain: ActivitySubDomain) => {
    setConfirmingSubDomain(subDomain);
    setConfirmingDomain(null);
    setOpenConfirmToggleDomain(true);
  };

  const deleteDomain = (domain: ActivityDomain) => {
    setConfirmingDomain(domain);
    setOpenConfirmDeleteDomain(true);
  };

  const handleConfirmToggleDomain = async () => {
    if (confirmingDomain) {
      const isHide = confirmingDomain.active;
      await triggerDomain({ isVisible: !confirmingDomain.active });
      setConfirmingDomain(null);
      setOpenConfirmToggleDomain(false);
      refreshActivityDomains();
      toast.success(`${isHide ? 'Ẩn' : 'Hiện'} lĩnh vực thành công!`);
    }
    if (confirmingSubDomain) {
      const isHide = confirmingSubDomain.active;
      await triggerSubDomain({ isVisible: !confirmingSubDomain.active });
      setConfirmingSubDomain(null);
      setOpenConfirmToggleDomain(false);
      refreshActivityDomains();
      toast.success(`${isHide ? 'Ẩn' : 'Hiện'} lĩnh vực con thành công!`);
    }
  };

  const handleConfirmToggleSubDomain = async () => {
    if (confirmingDomain) {
      await triggerDomain({ isVisible: !confirmingDomain.active });
      setConfirmingDomain(null);
      setOpenConfirmToggleDomain(false);
      refreshActivityDomains();
    }
    if (confirmingSubDomain) {
      await triggerSubDomain({ isVisible: !confirmingSubDomain.active });
      setConfirmingSubDomain(null);
      setOpenConfirmToggleDomain(false);
      refreshActivityDomains();
    }
  };

  const handleConfirmDeleteDomain = () => {
    if (!confirmingDomain) return;
    setActivityDomains(
      activityDomains.filter((d) => d.id !== confirmingDomain.id)
    );
    setOpenConfirmDeleteDomain(false);
    setConfirmingDomain(null);
    setSelectedDomain((prev) =>
      prev?.id === confirmingDomain.id ? null : prev
    );
  };

  const handleConfirmDeleteSubDomain = () => {
    if (!confirmingSubDomain) return;
    setActivityDomains((prev) =>
      prev.map((domain) => ({
        ...domain,
        activitySubDomains: (domain.activitySubDomains ?? []).filter(
          (d) => String(d.id) !== String(confirmingSubDomain.id)
        )
      }))
    );
    setSelectedDomain((prev) =>
      prev
        ? {
            ...prev,
            activitySubDomains: (prev.activitySubDomains ?? []).filter(
              (d) => String(d.id) !== String(confirmingSubDomain.id)
            )
          }
        : prev
    );
    setOpenConfirmDeleteSubDomain(false);
    setConfirmingSubDomain(null);
  };

  const getSubDomainsByDomain = (domainId: number | string) => {
    return (
      activityDomains.find((d) => d.id === domainId)?.activitySubDomains ?? []
    );
  };

  // State to keep original sub domain order for each domain
  const [subDomainOrderMap, setSubDomainOrderMap] = useState<
    Record<string, string[]>
  >({});

  // Update subDomainOrderMap when fetchedActivityDomains changes
  useEffect(() => {
    if (fetchedActivityDomains.length) {
      const orderMap: Record<string, string[]> = {};
      fetchedActivityDomains.forEach((domain) => {
        orderMap[String(domain.id)] = (domain.activitySubDomains ?? []).map(
          (sd) => String(sd.id)
        );
      });
      setSubDomainOrderMap(orderMap);
    }
  }, [fetchedActivityDomains]);

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Cấu hình sự kiện"
      description="Quản lý lĩnh vực hoạt động và các lĩnh vực con"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Domains */}
        <Card className="bg-white dark:bg-zinc-950 p-6 border-zinc-300 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Lĩnh vực hoạt động
            </h3>
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                resetForm();
                setOpenDetailDomainModal(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityDomains.map((domain) => (
              <div
                key={domain.id}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                  String(selectedDomain?.id) === String(domain.id)
                    ? 'border-blue-400 bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-950/40'
                    : 'border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                }`}
                onClick={() => setSelectedDomain(domain)}
              >
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      String(selectedDomain?.id) === String(domain.id)
                        ? 'font-semibold text-blue-700 dark:text-blue-300'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {domain.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={domain.active}
                    onCheckedChange={() => handleSwitchDomain(domain)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sub Activity Domains & Domain Details */}
        <Card className="bg-white dark:bg-zinc-950 p-6 border-zinc-300 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Chi tiết lĩnh vực
          </h3>

          {selectedDomain ? (
            <div className="space-y-6">
              {/* Domain Information */}
              <div className="bg-white rounded-lg p-4 border border-zinc-300 space-y-3">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Tên lĩnh vực
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1">
                    {selectedDomain.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Thời gian phục vụ tối đa
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 mt-1">
                      {selectedDomain.specialSessionMaxTime || 4} tiếng
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Trạng thái
                    </p>
                    <div className="mt-1">
                      {selectedDomain.active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-300">
                          Public
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border border-zinc-300">
                          Hide
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {selectedDomain.createdAt && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Ngày tạo
                    </p>
                    <p className="text-sm text-zinc-700 mt-1">
                      {new Date(selectedDomain.createdAt).toLocaleDateString(
                        'vi-VN'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Sub Activity Domains */}
              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-zinc-900">
                    Lĩnh vực con (
                    {selectedDomain.activitySubDomains?.length ?? 0})
                  </h4>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedDomain.activitySubDomains?.length > 0 ? (
                    selectedDomain.activitySubDomains?.map((subDomain) => (
                      <div
                        key={subDomain.id}
                        className="flex items-center justify-between gap-2 bg-white rounded p-3 border border-zinc-200"
                      >
                        <span className="text-sm text-zinc-700">
                          {subDomain.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subDomain.active}
                            onCheckedChange={() => {
                              // Only allow switching for subdomains with numeric id (persisted)
                              if (typeof subDomain.id === 'number') {
                                handleSwitchSubDomain(
                                  subDomain as ActivitySubDomain
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-3">
                      Không có lĩnh vực con
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Chọn một lĩnh vực hoạt động để xem chi tiết
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Domain Modal */}
      <Dialog open={openAddDomainModal} onOpenChange={setOpenAddDomainModal}>
        <DialogContent className="max-w-md bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              Thêm lĩnh vực hoạt động
            </DialogTitle>
            <DialogDescription>
              Nhập tên lĩnh vực hoạt động mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tên lĩnh vực <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập tên lĩnh vực"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddDomain();
                  }}
                  className="mt-1 bg-white border-zinc-300 focus:border-zinc-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setOpenAddDomainModal(false)}
                className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddDomain}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Thêm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Domain Modal */}
      <Dialog
        open={openDetailDomainModal}
        onOpenChange={setOpenDetailDomainModal}
      >
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto bg-white dark:bg-white">
          <DialogHeader className="mb-6 pb-4">
            <DialogTitle className="text-xl font-bold text-black">
              {editingDomain
                ? 'Chỉnh sửa lĩnh vực hoạt động'
                : 'Thêm lĩnh vực hoạt động'}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 mt-1">
              {editingDomain
                ? 'Cập nhật thông tin lĩnh vực hoạt động'
                : 'Nhập thông tin lĩnh vực hoạt động mới'}
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          )}

          <div className="space-y-7">
            {/* Basic Information */}
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-2">
                    Tên lĩnh vực <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập tên lĩnh vực"
                    value={formData.name}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white border-zinc-300 focus:border-zinc-400 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Time Information */}
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Thời gian phục vụ tối đa{' '}
                <span className="text-red-500">
                  (mặc định 4 tiếng nhưng ko được vượt quá 12 tiếng)
                </span>
              </label>
              <Input
                type="number"
                placeholder="Nhập số giờ"
                max={12}
                disabled={isSubmitting}
                value={formData.max_service_time}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    max_service_time: e.target.value
                  });
                  setServiceTimeError('');
                }}
                onBlur={handleServiceTimeBlur}
                className={`bg-white border-zinc-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  serviceTimeError ? 'border-red-500' : ''
                }`}
              />
              {serviceTimeError && (
                <p className="text-sm text-red-500 mt-1">{serviceTimeError}</p>
              )}
            </div>

            {/* Lĩnh vực con */}
            <div>
              <h4 className="font-medium text-sm text-zinc-900 mb-3">
                Lĩnh vực con
              </h4>
              <div className="bg-white rounded-lg p-4 border border-zinc-200">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-700">
                    Thêm lĩnh vực con
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tên lĩnh vực con"
                      disabled={isSubmitting}
                      value={draftSubDomainName}
                      onChange={(e) => setDraftSubDomainName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddDraftSubDomain();
                      }}
                      className="bg-white border-zinc-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      onClick={handleAddDraftSubDomain}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm lĩnh vực con
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto mt-4">
                  {draftSubDomains.length > 0 ? (
                    draftSubDomains.map((subDomain) => (
                      <div
                        key={subDomain.id}
                        className="flex items-center justify-between gap-2 bg-white rounded p-3 border border-zinc-200"
                      >
                        <span className="text-sm text-zinc-700">
                          {subDomain.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subDomain.active}
                            onCheckedChange={() => {
                              // Only allow switching for subdomains with numeric id (persisted)
                              if (typeof subDomain.id === 'number') {
                                handleSwitchSubDomain(
                                  subDomain as ActivitySubDomain
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-3">
                      Chưa có lĩnh vực con
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                onClick={() => {
                  resetForm();
                  setOpenDetailDomainModal(false);
                }}
                className="px-6 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Hủy
              </Button>
              <Button
                onClick={editingDomain ? handleEditDomain : handleAddDomain}
                disabled={!formData.name.trim() || isSubmitting}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Đang lưu...'
                  : editingDomain
                    ? 'Cập nhật lĩnh vực'
                    : 'Tạo lĩnh vực'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Sub Domain Modal */}
      <Dialog
        open={openAddSubDomainModal}
        onOpenChange={setOpenAddSubDomainModal}
      >
        <DialogContent className="max-w-md bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Thêm lĩnh vực con</DialogTitle>
            <DialogDescription>
              Nhập tên lĩnh vực con mới cho {selectedDomain?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tên lĩnh vực con <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên lĩnh vực con"
                value={newSubDomainName}
                onChange={(e) => setNewSubDomainName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddSubDomain();
                }}
                className="mt-1 bg-white border-zinc-300 focus:border-zinc-400 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setOpenAddSubDomainModal(false)}
                className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddSubDomain}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Thêm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Toggle Domain Modal */}
      <Dialog
        open={openConfirmToggleDomain}
        onOpenChange={setOpenConfirmToggleDomain}
      >
        <DialogContent className="max-w-md bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="pr-8 text-left text-xl font-bold text-zinc-900">
              {(confirmingDomain &&
                !confirmingSubDomain &&
                confirmingDomain.active) ||
              (confirmingSubDomain && confirmingSubDomain.active)
                ? `Ẩn lĩnh vực "${confirmingDomain?.name || confirmingSubDomain?.name}"?`
                : `Hiện lĩnh vực "${confirmingDomain?.name || confirmingSubDomain?.name}"?`}
            </DialogTitle>
            <DialogDescription className="pt-1 text-left text-[15px] leading-7 text-[#667085]">
              {confirmingSubDomain ? (
                confirmingSubDomain.active ? (
                  <>
                    Khi ẩn lĩnh vực con này,
                    <span className="font-normal"> </span>
                    <span className="font-medium text-[#DC2626]">
                      Người dùng sẽ không thể xem hoặc chọn lĩnh vực con này.
                    </span>
                  </>
                ) : (
                  <>
                    Khi hiện lĩnh vực con này,
                    <span className="font-normal"> </span>
                    <span className="font-medium text-[#16A34A]">
                      Người dùng có thể xem và chọn lĩnh vực con này.
                    </span>
                  </>
                )
              ) : confirmingDomain ? (
                confirmingDomain.active ? (
                  <>
                    Khi ẩn lĩnh vực này, tất cả{' '}
                    <span className="font-bold text-[#DC2626]">
                      {confirmingDomain.activitySubDomains?.length || 0} lĩnh
                      vực con
                    </span>{' '}
                    và các kỹ năng bên trong cũng sẽ bị ẩn.
                    <br />
                    <span className="font-medium text-[#DC2626]">
                      Người dùng sẽ không thể xem hoặc chọn lĩnh vực này.
                    </span>
                  </>
                ) : (
                  <>
                    Khi hiện lĩnh vực này, tất cả{' '}
                    <span className="font-bold text-[#16A34A]">
                      {confirmingDomain.activitySubDomains?.length || 0} lĩnh
                      vực con
                    </span>{' '}
                    và các kỹ năng bên trong sẽ được hiển thị trở lại.
                    <br />
                    <span className="font-medium text-[#16A34A]">
                      Người dùng có thể xem và chọn lĩnh vực này.
                    </span>
                  </>
                )
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              onClick={() => {
                setOpenConfirmToggleDomain(false);
                setConfirmingDomain(null);
                setConfirmingSubDomain(null);
              }}
              className="rounded-md border border-[#D0D5DD] bg-white px-6 py-2 text-base font-medium text-[#6B7280] hover:bg-[#F9FAFB]"
              style={{ minWidth: 110 }}
            >
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (confirmingDomain) {
                  await triggerDomain({ isVisible: !confirmingDomain.active });
                  setConfirmingDomain(null);
                  setOpenConfirmToggleDomain(false);
                  refreshActivityDomains();
                  toast.success('Cập nhật trạng thái lĩnh vực thành công!');
                } else if (confirmingSubDomain) {
                  await triggerSubDomain({
                    isVisible: !confirmingSubDomain.active
                  });
                  setConfirmingSubDomain(null);
                  setOpenConfirmToggleDomain(false);
                  refreshActivityDomains();
                  toast.success('Cập nhật trạng thái lĩnh vực con thành công!');
                }
              }}
              className={
                (confirmingDomain &&
                  !confirmingSubDomain &&
                  confirmingDomain.active) ||
                (confirmingSubDomain && confirmingSubDomain.active)
                  ? 'rounded-md bg-[#DC2626] px-6 py-2 text-base font-semibold text-white hover:bg-[#B91C1C]'
                  : 'rounded-md bg-[#16A34A] px-6 py-2 text-base font-semibold text-white hover:bg-[#15803D]'
              }
              style={{ minWidth: 130 }}
            >
              {(confirmingDomain &&
                !confirmingSubDomain &&
                confirmingDomain.active) ||
              (confirmingSubDomain && confirmingSubDomain.active)
                ? `Xác nhận ẩn`
                : `Xác nhận hiện`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Domain Modal */}
      <Dialog
        open={openConfirmDeleteDomain}
        onOpenChange={setOpenConfirmDeleteDomain}
      >
        <DialogContent className="max-w-md bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              Xác nhận ẩn lĩnh vực
            </DialogTitle>
            <DialogDescription>
              {confirmingDomain && (
                <span className="text-red-600">
                  Bạn có chắc muốn ẩn lĩnh vực{' '}
                  <strong>{confirmingDomain.name}</strong> và tất cả lĩnh vực
                  con của nó không?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setOpenConfirmDeleteDomain(false);
                setConfirmingDomain(null);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDeleteDomain}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ẩn
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Sub Domain Modal */}
      <Dialog
        open={openConfirmDeleteSubDomain}
        onOpenChange={setOpenConfirmDeleteSubDomain}
      >
        <DialogContent className="max-w-md bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              Xác nhận ẩn lĩnh vực con
            </DialogTitle>
            <DialogDescription>
              {confirmingSubDomain && (
                <span className="text-red-600">
                  Bạn có chắc muốn ẩn lĩnh vực con{' '}
                  <strong>{confirmingSubDomain.name}</strong> không?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setOpenConfirmDeleteSubDomain(false);
                setConfirmingSubDomain(null);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDeleteSubDomain}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ẩn
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
