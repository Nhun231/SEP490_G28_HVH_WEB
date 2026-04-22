'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  orgId: string;
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const mockOrgDetail = {
  name: 'Đoàn Thanh niên Thành phố Hồ Chí Minh',
  taxCode: '0312345678',
  location: 'Q.1, TPHCM',
  orgType: 'Nhóm xã hội',
  basicInfo: {
    email: 'contact@doanthanhniensaigon.org.vn',
    address: 'Lầu 8, Phạm Chu Trinh, Phường Chân Lạn, Hà Nội',
    founded: 'Loại Nhà nước',
    yearRegistered: '2020506061'
  },
  adminInfo: {
    name: 'Đoàn Bình An',
    position: 'Khác',
    phone: '0988123456',
    email: 'binhanthanhniensaigon@gmail.com',
    cccd: '001290906012'
  },
  introduction:
    'Đoàn Thanh niên Thành phố Hồ Chí Minh là một tổ chức lâu đời hỗ trợ các hoạt động xã hội tại Việt Nam.',
  applicationReason:
    'Chúng tôi muốn mở rộng các hoạt động tình nguyện và nâng cao chất lượng phục vụ cộng đồng.'
};

type AdminCandidate = {
  name: string;
  position: string;
  phone: string;
  email: string;
  cccd: string;
};

const mockAdminCandidates: AdminCandidate[] = [
  {
    name: 'Đoàn Bình An',
    position: 'Khác',
    phone: '0988123456',
    email: 'binhanthanhniensaigon@gmail.com',
    cccd: '001290906012'
  },
  {
    name: 'Nguyễn Quang Vinh',
    position: 'Giám đốc',
    phone: '0977555123',
    email: 'vinh.nguyen@greenfuture.vn',
    cccd: '079205001234'
  },
  {
    name: 'Trần Mỹ Hạnh',
    position: 'Phó giám đốc',
    phone: '0909222333',
    email: 'hanh.tran@vietaid.org',
    cccd: '079205009999'
  },
  {
    name: 'Lê Hoàng Nam',
    position: 'Quản lý dự án',
    phone: '0911333444',
    email: 'nam.le@communitycare.vn',
    cccd: '012345678901'
  }
];

export default function OrganizationEditPage({
  orgId,
  user,
  userDetails
}: Props) {
  const router = useRouter();
  const [adminSearchResults, setAdminSearchResults] = useState<
    AdminCandidate[]
  >([]);
  const [adminSearchExecuted, setAdminSearchExecuted] = useState(false);

  const [formData, setFormData] = useState({
    name: mockOrgDetail.name,
    taxCode: mockOrgDetail.taxCode,
    location: mockOrgDetail.location,
    orgType: mockOrgDetail.orgType,
    orgEmail: mockOrgDetail.basicInfo.email,
    orgAddress: mockOrgDetail.basicInfo.address,
    foundedType: mockOrgDetail.basicInfo.founded,
    yearRegistered: mockOrgDetail.basicInfo.yearRegistered,
    adminName: mockOrgDetail.adminInfo.name,
    adminPosition: mockOrgDetail.adminInfo.position,
    adminPhone: mockOrgDetail.adminInfo.phone,
    adminEmail: mockOrgDetail.adminInfo.email,
    adminCccd: mockOrgDetail.adminInfo.cccd,
    introduction: mockOrgDetail.introduction,
    applicationReason: mockOrgDetail.applicationReason
  });

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const inputClassByValue = (value: string) =>
    `${value.trim() ? 'bg-white' : 'bg-zinc-100'} border-zinc-200 text-zinc-900`;

  const handleSearchAdmins = () => {
    const normalize = (value: string) => value.toLowerCase().trim();
    const queryName = normalize(formData.adminName);
    const queryPhone = normalize(formData.adminPhone);
    const queryEmail = normalize(formData.adminEmail);
    const queryCccd = normalize(formData.adminCccd);

    const hasQuery = Boolean(
      queryName || queryPhone || queryEmail || queryCccd
    );
    if (!hasQuery) {
      setAdminSearchResults([]);
      setAdminSearchExecuted(true);
      return;
    }

    const filtered = mockAdminCandidates.filter((candidate) => {
      const byName =
        !queryName || normalize(candidate.name).includes(queryName);
      const byPhone =
        !queryPhone || normalize(candidate.phone).includes(queryPhone);
      const byEmail =
        !queryEmail || normalize(candidate.email).includes(queryEmail);
      const byCccd =
        !queryCccd || normalize(candidate.cccd).includes(queryCccd);
      return byName && byPhone && byEmail && byCccd;
    });

    setAdminSearchResults(filtered);
    setAdminSearchExecuted(true);
  };

  const handleSelectAdmin = (candidate: AdminCandidate) => {
    setFormData((prev) => ({
      ...prev,
      adminName: candidate.name,
      adminPosition: candidate.position,
      adminPhone: candidate.phone,
      adminEmail: candidate.email,
      adminCccd: candidate.cccd
    }));
  };

  const handleClearAdminInputs = () => {
    setFormData((prev) => ({
      ...prev,
      adminName: '',
      adminPosition: '',
      adminPhone: '',
      adminEmail: '',
      adminCccd: ''
    }));
    setAdminSearchResults([]);
    setAdminSearchExecuted(false);
  };

  const handleSave = () => {
    router.push(`/dashboard/organizations/${orgId}`);
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Cập nhật tổ chức"
      description="Chỉnh sửa thông tin tổ chức"
    >
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại chi tiết tổ chức</span>
          </button>
        </div>

        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 md:text-2xl">
            Thông tin cơ bản
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-zinc-600">Tên tổ chức</p>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClassByValue(formData.name)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Mã số thuế</p>
              <Input
                value={formData.taxCode}
                onChange={(e) => updateField('taxCode', e.target.value)}
                className={inputClassByValue(formData.taxCode)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Khu vực</p>
              <Input
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={inputClassByValue(formData.location)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Loại hình tổ chức</p>
              <Input
                value={formData.orgType}
                onChange={(e) => updateField('orgType', e.target.value)}
                className={inputClassByValue(formData.orgType)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Email tổ chức</p>
              <Input
                value={formData.orgEmail}
                onChange={(e) => updateField('orgEmail', e.target.value)}
                className={inputClassByValue(formData.orgEmail)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Năm đăng ký</p>
              <Input
                value={formData.yearRegistered}
                onChange={(e) => updateField('yearRegistered', e.target.value)}
                className={inputClassByValue(formData.yearRegistered)}
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-zinc-600">Địa chỉ tổ chức</p>
              <Input
                value={formData.orgAddress}
                onChange={(e) => updateField('orgAddress', e.target.value)}
                className={inputClassByValue(formData.orgAddress)}
              />
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 md:text-2xl">
            Thông tin quản trị viên
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-zinc-600">Tên quản trị viên</p>
              <Input
                value={formData.adminName}
                onChange={(e) => updateField('adminName', e.target.value)}
                className={inputClassByValue(formData.adminName)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Chức vụ</p>
              <Input
                value={formData.adminPosition}
                onChange={(e) => updateField('adminPosition', e.target.value)}
                className={inputClassByValue(formData.adminPosition)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Số điện thoại</p>
              <Input
                value={formData.adminPhone}
                onChange={(e) => updateField('adminPhone', e.target.value)}
                className={inputClassByValue(formData.adminPhone)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Email liên hệ</p>
              <Input
                value={formData.adminEmail}
                onChange={(e) => updateField('adminEmail', e.target.value)}
                className={inputClassByValue(formData.adminEmail)}
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-zinc-600">CCCD</p>
              <Input
                value={formData.adminCccd}
                onChange={(e) => updateField('adminCccd', e.target.value)}
                className={inputClassByValue(formData.adminCccd)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSearchAdmins}
            >
              Tìm kiếm
            </Button>
            <Button
              type="button"
              className="bg-zinc-600 text-white hover:bg-zinc-700"
              onClick={handleClearAdminInputs}
            >
              Làm lại
            </Button>
          </div>

          {adminSearchExecuted && (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white">
              {adminSearchResults.length === 0 ? (
                <p className="p-3 text-sm text-zinc-500">
                  Không tìm thấy quản trị viên phù hợp.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  {adminSearchResults.map((candidate) => (
                    <button
                      key={`${candidate.cccd}-${candidate.phone}`}
                      type="button"
                      className="w-full border-b border-zinc-100 p-3 text-left last:border-b-0 hover:bg-zinc-50"
                      onClick={() => handleSelectAdmin(candidate)}
                    >
                      <p className="text-sm font-semibold text-zinc-900">
                        {candidate.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {candidate.position} • {candidate.phone} •{' '}
                        {candidate.email}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="mb-6 border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 md:text-2xl">
            Nội dung mô tả
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm text-zinc-600">Giới thiệu tổ chức</p>
              <Textarea
                value={formData.introduction}
                onChange={(e) => updateField('introduction', e.target.value)}
                className="border-zinc-200 bg-white text-zinc-900 min-h-28"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-600">Lý do ứng tuyển</p>
              <Textarea
                value={formData.applicationReason}
                onChange={(e) =>
                  updateField('applicationReason', e.target.value)
                }
                className="border-zinc-200 bg-white text-zinc-900 min-h-28"
              />
            </div>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
          >
            Hủy
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            Lưu cập nhật
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
