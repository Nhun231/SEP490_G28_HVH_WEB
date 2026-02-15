'use client';

import DashboardLayout from '@/components/layout';
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
import { useCreateActivityDomain } from '@/hooks/features/uc060-create-service-domain-service-sub-domain/useCreateActivityDomain';
import { useUpdateActivityDomain } from '@/hooks/features/uc061-update-activity-domain-activity-sub-domain/useUpdateActivityDomain';
import { useGetListActivityDomain } from '@/hooks/features/uc063-view-activity-domain-activity-sub-domain/useGetListActivityDomain';
import type {
  UpdateActivityDomainRequest,
  UpdateActivitySubDomainRequest
} from '@/hooks/dto';
import { User } from '@supabase/supabase-js';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

interface ActivityDomain {
  id: string;
  name: string;
  active: boolean;
  activitySubDomainList?: SubActivityDomain[];
  start_time?: string;
  end_time?: string;
  service_time?: string;
  max_service_time?: string;
  created_at: string;
}

interface SubActivityDomain {
  id: string;
  activity_domain_id?: string;
  name: string;
  active: boolean;
  created_at?: string;
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

  const fetchedActivityDomains = useMemo<ActivityDomain[]>(() => {
    return (activityDomainData?.content ?? []).map((domain, index) => {
      const domainId = domain.id ? String(domain.id) : String(index + 1);
      return {
        id: domainId,
        name: domain.name,
        active: domain.active,
        activitySubDomainList: (domain.activitySubDomainList ?? []).map(
          (subDomain, subIndex) => ({
            id: String(subDomain.id ?? `${domainId}-${subIndex + 1}`),
            activity_domain_id: domainId,
            name: subDomain.name,
            active: subDomain.active
          })
        ),
        max_service_time: domain.specialSessionMaxTime
          ? String(domain.specialSessionMaxTime)
          : '',
        created_at: domain.createdAt ?? ''
      };
    });
  }, [activityDomainData]);

  const [activityDomains, setActivityDomains] = useState<ActivityDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<ActivityDomain | null>(
    null
  );
  const [openAddDomainModal, setOpenAddDomainModal] = useState(false);
  const [openDetailDomainModal, setOpenDetailDomainModal] = useState(false);
  const [openAddSubDomainModal, setOpenAddSubDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<ActivityDomain | null>(
    null
  );
  const [newDomainName, setNewDomainName] = useState('');
  const [newSubDomainName, setNewSubDomainName] = useState('');
  const [draftSubDomainName, setDraftSubDomainName] = useState('');
  const [draftSubDomains, setDraftSubDomains] = useState<SubActivityDomain[]>(
    []
  );
  const [editingSubDomainId, setEditingSubDomainId] = useState<string | null>(
    null
  );
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
      id: editingDomain?.id ?? '',
      baseUrl: apiBaseUrl
    });
  const isSubmitting = isCreating || isUpdating;

  // Confirmation modals
  const [openConfirmToggleDomain, setOpenConfirmToggleDomain] = useState(false);
  const [openConfirmDeleteDomain, setOpenConfirmDeleteDomain] = useState(false);
  const [openConfirmDeleteSubDomain, setOpenConfirmDeleteSubDomain] =
    useState(false);
  const [confirmingDomain, setConfirmingDomain] =
    useState<ActivityDomain | null>(null);
  const [confirmingSubDomain, setConfirmingSubDomain] =
    useState<SubActivityDomain | null>(null);

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
        activitySubDomainUpdateRequests: draftSubDomains.map((d) => d.name)
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
      const originalSubDomains = editingDomain.activitySubDomainList ?? [];
      const currentSubDomains = draftSubDomains;
      const originalById = new Map<number, SubActivityDomain>();
      const currentById = new Map<number, SubActivityDomain>();

      originalSubDomains.forEach((subDomain) => {
        const idValue = Number(subDomain.id);
        if (Number.isFinite(idValue)) {
          originalById.set(idValue, subDomain);
        }
      });

      currentSubDomains.forEach((subDomain) => {
        const idValue = Number(subDomain.id);
        if (Number.isFinite(idValue)) {
          currentById.set(idValue, subDomain);
        }
      });

      const activitySubDomainUpdateRequests: UpdateActivitySubDomainRequest[] =
        [
          ...originalSubDomains.flatMap(
            (subDomain): UpdateActivitySubDomainRequest[] => {
              const idValue = Number(subDomain.id);
              if (!Number.isFinite(idValue)) return [];
              const current = currentById.get(idValue);
              if (!current) {
                return [{ id: idValue, action: 'DELETE' as const }];
              }
              if (current.name.trim() !== subDomain.name.trim()) {
                return [
                  {
                    id: idValue,
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
              const idValue = Number(subDomain.id);
              if (Number.isFinite(idValue)) return [];
              const name = subDomain.name.trim();
              if (!name) return [];
              return [{ name, action: 'ADD' as const }];
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
    const value = formData.max_service_time;
    const numValue = Number(value);
    if (numValue < 4 || numValue > 12) {
      setServiceTimeError('Giá trị phải từ 4 đến 12 giờ');
    } else {
      setServiceTimeError('');
    }
  };

  const openEditModal = (domain: ActivityDomain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      service_time: domain.service_time || '',
      max_service_time: domain.max_service_time || ''
    });
    setServiceTimeReason('');
    setDraftSubDomainName('');
    setDraftSubDomains(domain.activitySubDomainList ?? []);
    setOpenDetailDomainModal(true);
  };

  const handleAddDraftSubDomain = () => {
    if (!draftSubDomainName.trim()) return;
    const newDraft: SubActivityDomain = {
      id: `draft-${Date.now()}`,
      name: draftSubDomainName.trim(),
      active: true
    };
    setDraftSubDomains((prev) => [...prev, newDraft]);
    setDraftSubDomainName('');
  };

  const removeDraftSubDomain = (subDomainId: string) => {
    setDraftSubDomains((prev) => prev.filter((d) => d.id !== subDomainId));
  };

  const startEditSubDomain = (subDomain: SubActivityDomain) => {
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
    const newSubDomain: SubActivityDomain = {
      id: `${selectedDomain.id}-${Date.now()}`,
      activity_domain_id: selectedDomain.id,
      name: newSubDomainName,
      active: true,
      created_at: new Date().toISOString()
    };
    setActivityDomains((prev) =>
      prev.map((domain) =>
        domain.id === selectedDomain.id
          ? {
              ...domain,
              activitySubDomainList: [
                ...(domain.activitySubDomainList ?? []),
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
            activitySubDomainList: [
              ...(prev.activitySubDomainList ?? []),
              newSubDomain
            ]
          }
        : prev
    );
    setNewSubDomainName('');
    setOpenAddSubDomainModal(false);
  };

  const toggleDomainActive = (domain: ActivityDomain) => {
    setConfirmingDomain(domain);
    setOpenConfirmToggleDomain(true);
  };

  const handleConfirmToggleDomain = () => {
    if (!confirmingDomain) return;
    setActivityDomains(
      activityDomains.map((d) =>
        d.id === confirmingDomain.id ? { ...d, active: !d.active } : d
      )
    );
    setOpenConfirmToggleDomain(false);
    setConfirmingDomain(null);
  };

  const toggleSubDomainActive = (subDomain: SubActivityDomain) => {
    setConfirmingSubDomain(subDomain);
    setOpenConfirmToggleDomain(true);
  };

  const handleConfirmToggleSubDomain = () => {
    if (!confirmingSubDomain) return;
    setActivityDomains((prev) =>
      prev.map((domain) => ({
        ...domain,
        activitySubDomainList: (domain.activitySubDomainList ?? []).map((d) =>
          d.id === confirmingSubDomain.id ? { ...d, active: !d.active } : d
        )
      }))
    );
    setSelectedDomain((prev) =>
      prev
        ? {
            ...prev,
            activitySubDomainList: (prev.activitySubDomainList ?? []).map(
              (d) =>
                d.id === confirmingSubDomain.id
                  ? { ...d, active: !d.active }
                  : d
            )
          }
        : prev
    );
    setOpenConfirmToggleDomain(false);
    setConfirmingSubDomain(null);
  };

  const deleteDomain = (domain: ActivityDomain) => {
    setConfirmingDomain(domain);
    setOpenConfirmDeleteDomain(true);
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

  const deleteSubDomain = (subDomain: SubActivityDomain) => {
    setConfirmingSubDomain(subDomain);
    setOpenConfirmDeleteSubDomain(true);
  };

  const handleConfirmDeleteSubDomain = () => {
    if (!confirmingSubDomain) return;
    setActivityDomains((prev) =>
      prev.map((domain) => ({
        ...domain,
        activitySubDomainList: (domain.activitySubDomainList ?? []).filter(
          (d) => d.id !== confirmingSubDomain.id
        )
      }))
    );
    setSelectedDomain((prev) =>
      prev
        ? {
            ...prev,
            activitySubDomainList: (prev.activitySubDomainList ?? []).filter(
              (d) => d.id !== confirmingSubDomain.id
            )
          }
        : prev
    );
    setOpenConfirmDeleteSubDomain(false);
    setConfirmingSubDomain(null);
  };

  const getSubDomainsByDomain = (domainId: string) => {
    return (
      activityDomains.find((d) => d.id === domainId)?.activitySubDomainList ??
      []
    );
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Cấu hình sự kiện"
      description="Quản lý lĩnh vực hoạt động và các lĩnh vực con"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Domains */}
        <Card className="p-6 border-zinc-300 dark:border-zinc-700">
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
                className="flex items-center justify-between rounded-lg border border-zinc-300 p-3 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950"
                onClick={() => setSelectedDomain(domain)}
              >
                <div
                  className={`flex-1 ${
                    selectedDomain?.id === domain.id
                      ? 'font-semibold text-blue-600'
                      : ''
                  }`}
                >
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {domain.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={domain.active}
                    onCheckedChange={() => toggleDomainActive(domain)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(domain);
                    }}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDomain(domain);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sub Activity Domains */}
        <Card className="p-6 border-zinc-300 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Lĩnh vực con
              {selectedDomain && (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({selectedDomain.name})
                </span>
              )}
            </h3>
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedDomain}
              onClick={() => setOpenAddSubDomainModal(true)}
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedDomain ? (
              getSubDomainsByDomain(selectedDomain.id).length > 0 ? (
                getSubDomainsByDomain(selectedDomain.id).map((subDomain) => (
                  <div
                    key={subDomain.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-300 p-3 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {subDomain.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={subDomain.active}
                        onCheckedChange={() => toggleSubDomainActive(subDomain)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubDomain(subDomain)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Không có lĩnh vực con
                </p>
              )
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Chọn một lĩnh vực để xem lĩnh vực con
              </p>
            )}
          </div>
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
                  className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500"
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
                    className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Time Information */}
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
                min={4}
                max={12}
                disabled={isSubmitting}
                value={formData.max_service_time || '4'}
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
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
                        {editingSubDomainId === subDomain.id ? (
                          <Input
                            value={editingSubDomainName}
                            disabled={isSubmitting}
                            onChange={(e) =>
                              setEditingSubDomainName(e.target.value)
                            }
                            onBlur={applyEditSubDomain}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') applyEditSubDomain();
                              if (e.key === 'Escape') {
                                setEditingSubDomainId(null);
                                setEditingSubDomainName('');
                              }
                            }}
                            className="bg-white border-zinc-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
                          />
                        ) : (
                          <span className="text-sm text-zinc-700">
                            {subDomain.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => startEditSubDomain(subDomain)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => removeDraftSubDomain(subDomain.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
                className="mt-1 bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
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
            <DialogTitle className="text-black">
              Xác nhận thay đổi trạng thái
            </DialogTitle>
            <DialogDescription>
              {confirmingDomain && !confirmingSubDomain ? (
                <span>
                  Bạn có chắc muốn{' '}
                  {confirmingDomain.active ? 'vô hiệu hóa' : 'kích hoạt'} lĩnh
                  vực <strong>{confirmingDomain.name}</strong>?
                </span>
              ) : confirmingSubDomain ? (
                <span>
                  Bạn có chắc muốn{' '}
                  {confirmingSubDomain.active ? 'vô hiệu hóa' : 'kích hoạt'}{' '}
                  lĩnh vực con <strong>{confirmingSubDomain.name}</strong>?
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setOpenConfirmToggleDomain(false);
                setConfirmingDomain(null);
                setConfirmingSubDomain(null);
              }}
              className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (confirmingDomain && !confirmingSubDomain) {
                  handleConfirmToggleDomain();
                } else if (confirmingSubDomain) {
                  handleConfirmToggleSubDomain();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Xác nhận
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
              Xác nhận xóa lĩnh vực
            </DialogTitle>
            <DialogDescription>
              {confirmingDomain && (
                <span className="text-red-600">
                  Bạn có chắc muốn xóa lĩnh vực{' '}
                  <strong>{confirmingDomain.name}</strong> và tất cả lĩnh vực
                  con của nó không? Hành động này không thể hoàn tác.
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
              className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDeleteDomain}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
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
              Xác nhận xóa lĩnh vực con
            </DialogTitle>
            <DialogDescription>
              {confirmingSubDomain && (
                <span className="text-red-600">
                  Bạn có chắc muốn xóa lĩnh vực con{' '}
                  <strong>{confirmingSubDomain.name}</strong> không? Hành động
                  này không thể hoàn tác.
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
              className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDeleteSubDomain}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
