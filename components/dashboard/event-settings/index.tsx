'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

interface ActivityDomain {
  id: string;
  name: string;
  active: boolean;
  start_time?: string;
  end_time?: string;
  service_time?: string;
  max_service_time?: string;
  created_at: string;
}

interface SubActivityDomain {
  id: string;
  activity_domain_id: string;
  name: string;
  active: boolean;
  created_at: string;
}

// Mock data
const mockActivityDomains: ActivityDomain[] = [
  {
    id: '1',
    name: 'Giáo dục',
    active: true,
    start_time: '08:00',
    end_time: '17:00',
    service_time: '4',
    max_service_time: '8',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Môi trường',
    active: true,
    start_time: '06:00',
    end_time: '18:00',
    service_time: '8',
    max_service_time: '16',
    created_at: '2024-01-02'
  },
  {
    id: '3',
    name: 'Y tế',
    active: false,
    start_time: '07:00',
    end_time: '19:00',
    service_time: '6',
    max_service_time: '12',
    created_at: '2024-01-03'
  }
];

const mockSubActivityDomains: SubActivityDomain[] = [
  {
    id: '1',
    activity_domain_id: '1',
    name: 'Dạy học',
    active: true,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    activity_domain_id: '1',
    name: 'Hỗ trợ học tập',
    active: true,
    created_at: '2024-01-02'
  },
  {
    id: '3',
    activity_domain_id: '2',
    name: 'Trồng cây',
    active: true,
    created_at: '2024-01-03'
  }
];

export default function EventSettings(props: Props) {
  const [activityDomains, setActivityDomains] =
    useState<ActivityDomain[]>(mockActivityDomains);
  const [subActivityDomains, setSubActivityDomains] = useState<
    SubActivityDomain[]
  >(mockSubActivityDomains);
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
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    service_time: '',
    max_service_time: ''
  });

  // Confirmation modals
  const [openConfirmToggleDomain, setOpenConfirmToggleDomain] = useState(false);
  const [openConfirmDeleteDomain, setOpenConfirmDeleteDomain] = useState(false);
  const [openConfirmDeleteSubDomain, setOpenConfirmDeleteSubDomain] =
    useState(false);
  const [confirmingDomain, setConfirmingDomain] =
    useState<ActivityDomain | null>(null);
  const [confirmingSubDomain, setConfirmingSubDomain] =
    useState<SubActivityDomain | null>(null);

  const handleAddDomain = () => {
    if (!formData.name.trim()) return;
    const newDomain: ActivityDomain = {
      id: String(activityDomains.length + 1),
      name: formData.name,
      active: true,
      start_time: formData.start_time,
      end_time: formData.end_time,
      service_time: formData.service_time,
      max_service_time: formData.max_service_time,
      created_at: new Date().toISOString()
    };
    setActivityDomains([...activityDomains, newDomain]);
    resetForm();
    setOpenDetailDomainModal(false);
  };

  const handleEditDomain = () => {
    if (!editingDomain || !formData.name.trim()) return;
    setActivityDomains(
      activityDomains.map((d) =>
        d.id === editingDomain.id
          ? {
              ...d,
              name: formData.name,
              start_time: formData.start_time,
              end_time: formData.end_time,
              service_time: formData.service_time,
              max_service_time: formData.max_service_time
            }
          : d
      )
    );
    if (selectedDomain?.id === editingDomain.id) {
      setSelectedDomain({
        ...selectedDomain,
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        service_time: formData.service_time,
        max_service_time: formData.max_service_time
      });
    }
    resetForm();
    setOpenDetailDomainModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      service_time: '',
      max_service_time: ''
    });
    setEditingDomain(null);
  };

  const openEditModal = (domain: ActivityDomain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      start_time: domain.start_time || '',
      end_time: domain.end_time || '',
      service_time: domain.service_time || '',
      max_service_time: domain.max_service_time || ''
    });
    setOpenDetailDomainModal(true);
  };

  const handleAddSubDomain = () => {
    if (!newSubDomainName.trim() || !selectedDomain) return;
    const newSubDomain: SubActivityDomain = {
      id: String(subActivityDomains.length + 1),
      activity_domain_id: selectedDomain.id,
      name: newSubDomainName,
      active: true,
      created_at: new Date().toISOString()
    };
    setSubActivityDomains([...subActivityDomains, newSubDomain]);
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
    setSubActivityDomains(
      subActivityDomains.map((d) =>
        d.id === confirmingSubDomain.id ? { ...d, active: !d.active } : d
      )
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
    setSubActivityDomains(
      subActivityDomains.filter(
        (d) => d.activity_domain_id !== confirmingDomain.id
      )
    );
    setOpenConfirmDeleteDomain(false);
    setConfirmingDomain(null);
  };

  const deleteSubDomain = (subDomain: SubActivityDomain) => {
    setConfirmingSubDomain(subDomain);
    setOpenConfirmDeleteSubDomain(true);
  };

  const handleConfirmDeleteSubDomain = () => {
    if (!confirmingSubDomain) return;
    setSubActivityDomains(
      subActivityDomains.filter((d) => d.id !== confirmingSubDomain.id)
    );
    setOpenConfirmDeleteSubDomain(false);
    setConfirmingSubDomain(null);
  };

  const getSubDomainsByDomain = (domainId: string) => {
    return subActivityDomains.filter((d) => d.activity_domain_id === domainId);
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
            <DialogTitle className="text-blue-600">
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
                variant="outline"
                onClick={() => setOpenAddDomainModal(false)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
            <DialogTitle className="text-xl font-bold text-blue-600">
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Time Information */}
            <div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-2">
                      Thời gian bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_time: e.target.value
                        })
                      }
                      className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-2">
                      Thời gian kết thúc <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-2">
                      Thời gian phục vụ (giờ){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Nhập số giờ"
                      value={formData.service_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_time: e.target.value
                        })
                      }
                      className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-2">
                      Thời gian tối đa (giờ){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Nhập số giờ"
                      value={formData.max_service_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_service_time: e.target.value
                        })
                      }
                      className="bg-blue-50 border-blue-200 focus:border-blue-500 focus-visible:outline-none text-zinc-900 placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lĩnh vực con */}
            {editingDomain && (
              <div>
                <h4 className="font-medium text-sm text-zinc-900 mb-3">
                  Lĩnh vực con
                </h4>
                <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getSubDomainsByDomain(editingDomain.id).length > 0 ? (
                      getSubDomainsByDomain(editingDomain.id).map(
                        (subDomain) => (
                          <div
                            key={subDomain.id}
                            className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded p-3 border border-zinc-200 dark:border-zinc-700"
                          >
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              {subDomain.name}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              {subDomain.active
                                ? 'Hoạt động'
                                : 'Không hoạt động'}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                        Chưa có lĩnh vực con
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpenDetailDomainModal(false);
                }}
                className="px-6 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Hủy
              </Button>
              <Button
                onClick={editingDomain ? handleEditDomain : handleAddDomain}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {editingDomain ? 'Cập nhật lĩnh vực' : 'Tạo lĩnh vực'}
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
            <DialogTitle className="text-blue-600">
              Thêm lĩnh vực con
            </DialogTitle>
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
                variant="outline"
                onClick={() => setOpenAddSubDomainModal(false)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
            <DialogTitle className="text-blue-600">
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
              variant="outline"
              onClick={() => {
                setOpenConfirmToggleDomain(false);
                setConfirmingDomain(null);
                setConfirmingSubDomain(null);
              }}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
            <DialogTitle className="text-blue-600">
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
              variant="outline"
              onClick={() => {
                setOpenConfirmDeleteDomain(false);
                setConfirmingDomain(null);
              }}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
            <DialogTitle className="text-blue-600">
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
              variant="outline"
              onClick={() => {
                setOpenConfirmDeleteSubDomain(false);
                setConfirmingSubDomain(null);
              }}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
