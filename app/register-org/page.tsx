/* eslint-disable @next/next/no-img-element */

'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  EOrgType,
  REGISTERED_ORG_TYPE_OPTIONS,
  UNREGISTERED_ORG_TYPE_OPTIONS
} from '@/constants/org-type';
import { useRegisterOrg } from '@/hooks/features/uc016-register-organization/useRegisterOrg';
import { useSendRegisterOrgVerifyMail } from '@/hooks/features/uc016-register-organization/useSendRegisterOrgVerifyMail';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface RegisterOrgFormState {
  otp: string;
  name: string;
  dhaRegistered: boolean;
  orgType: EOrgType | '';
  orgIntroduction: string;
  managerFullName: string;
  managerCid: string;
  managerPhone: string;
  managerEmail: string;
  applicationReason: string;
  managerCidFront: File | null;
  managerCidBack: File | null;
  managerCidHolding: File | null;
  activityLicense: File | null;
  otherEvidences: File[];
}

export default function RegisterOrgPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const {
    trigger: registerOrg,
    isMutating: registering,
    error: registerError
  } = useRegisterOrg(apiBase);
  const {
    trigger: sendVerifyMail,
    isMutating: sendingMail,
    error: sendMailError
  } = useSendRegisterOrgVerifyMail(apiBase);
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openRegistrationHelp, setOpenRegistrationHelp] = useState(false);
  const [form, setForm] = useState<RegisterOrgFormState>({
    otp: '',
    name: '',
    dhaRegistered: false,
    orgType: '',
    orgIntroduction: '',
    managerFullName: '',
    managerCid: '',
    managerPhone: '',
    managerEmail: '',
    applicationReason: '',
    managerCidFront: null as File | null,
    managerCidBack: null as File | null,
    managerCidHolding: null as File | null,
    activityLicense: null as File | null,
    otherEvidences: [] as File[]
  });

  const orgTypeOptions = form.dhaRegistered
    ? REGISTERED_ORG_TYPE_OPTIONS
    : UNREGISTERED_ORG_TYPE_OPTIONS;

  const normalizeExtension = (raw: string) => {
    const ext = raw.trim().replace(/^\./, '').toLowerCase();
    return ext ? `.${ext}` : '';
  };

  const getFileExtension = (file: File | null) => {
    if (!file) return '';
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      return normalizeExtension(nameParts[nameParts.length - 1] || '');
    }
    switch (file.type) {
      case 'image/jpeg':
        return '.jpeg';
      case 'image/jpg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'application/pdf':
        return '.pdf';
      default:
        return '';
    }
  };

  const formatEvidenceExtensions = (files: Array<File | null>) => {
    const uniqueExtensions: string[] = [];

    files.forEach((file) => {
      const extension = getFileExtension(file);
      if (extension && !uniqueExtensions.includes(extension)) {
        uniqueExtensions.push(extension);
      }
    });

    return uniqueExtensions.join(' ');
  };

  const uploadToUrl = async (url: string, file: File) => {
    const res = await fetch(url, {
      method: 'PUT',
      body: file
    });

    if (!res.ok) {
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch {
        bodyText = '';
      }
      throw new Error(
        `Upload failed (${res.status})${bodyText ? `: ${bodyText}` : ''}`
      );
    }
  };

  // Dropzone for CMND/CCCD images
  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: (files) => {
        const file = files[0];
        if (!file) return;
        setForm((f) => ({
          ...f,
          managerCidFront: file
        }));
      }
    });
  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: (files) => {
        const file = files[0];
        if (!file) return;
        setForm((f) => ({
          ...f,
          managerCidBack: file
        }));
      }
    });
  const {
    getRootProps: getHoldingRootProps,
    getInputProps: getHoldingInputProps
  } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      setForm((f) => ({
        ...f,
        managerCidHolding: file
      }));
    }
  });

  // Dropzone for operating license
  const {
    getRootProps: getLicenseRootProps,
    getInputProps: getLicenseInputProps
  } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      setForm((f) => ({
        ...f,
        activityLicense: file
      }));
    }
  });
  // Dropzone for other evidences
  const { getRootProps: getOtherRootProps, getInputProps: getOtherInputProps } =
    useDropzone({
      accept: { 'image/*': [], 'application/pdf': [] },
      maxFiles: 5,
      onDrop: (files) => {
        if (!files || files.length === 0) return;
        setForm((f) => {
          const next = [...(f.otherEvidences || []), ...files].slice(0, 5);
          return {
            ...f,
            otherEvidences: next
          };
        });
      }
    });

  // Required fields validation
  const isFormValid =
    form.name &&
    form.orgType &&
    form.orgIntroduction &&
    form.managerFullName &&
    form.managerCid &&
    form.managerPhone &&
    form.managerEmail &&
    form.otp &&
    form.managerCidFront &&
    form.managerCidBack &&
    form.managerCidHolding &&
    form.activityLicense &&
    form.applicationReason;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-100 py-12 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/img/bg1.png')",
        backgroundSize: '200%'
      }}
    >
      <Card className="w-full max-w-2xl p-8 border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">
          Đăng ký tổ chức
        </h2>
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isFormValid) return;
            try {
              const managerCidFrontExtension = getFileExtension(
                form.managerCidFront
              );
              const managerCidBackExtension = getFileExtension(
                form.managerCidBack
              );
              const managerCidHoldingExtension = getFileExtension(
                form.managerCidHolding
              );
              const legalDocumentExtension = getFileExtension(
                form.activityLicense
              );
              const otherEvidencesExtensions = formatEvidenceExtensions(
                form.otherEvidences || []
              );

              setUploading(true);
              const registerRes = await registerOrg({
                otp: form.otp,
                name: form.name,
                dhaRegistered: form.dhaRegistered,
                orgType: form.orgType as EOrgType,
                orgIntroduction: form.orgIntroduction,
                managerFullName: form.managerFullName,
                managerCid: form.managerCid,
                managerPhone: form.managerPhone,
                managerEmail: form.managerEmail,
                managerCidFrontExtension,
                managerCidBackExtension,
                managerCidHoldingExtension,
                legalDocumentExtension,
                otherEvidencesExtensions,
                applicationReason: form.applicationReason
              });

              // After BE stores metadata and returns upload URLs, FE uploads files.
              const uploadInfo: any =
                registerRes && typeof registerRes === 'object'
                  ? (registerRes as any).uploadUrls || registerRes
                  : {};

              const frontUrl =
                uploadInfo.managerCidFrontUrl ||
                uploadInfo.managerCidFrontUploadUrl;
              const backUrl =
                uploadInfo.managerCidBackUrl ||
                uploadInfo.managerCidBackUploadUrl;
              const holdingUrl =
                uploadInfo.managerCidHoldingUrl ||
                uploadInfo.managerCidHoldingUploadUrl;

              const rawOtherUrls =
                uploadInfo.otherEvidencesUrls ||
                uploadInfo.otherEvidencesUploadUrls ||
                uploadInfo.otherEvidenceUrls ||
                uploadInfo.otherEvidenceUploadUrls ||
                [];
              const otherUrls: string[] = Array.isArray(rawOtherUrls)
                ? rawOtherUrls
                : typeof rawOtherUrls === 'string'
                  ? rawOtherUrls
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : [];

              const explicitLicenseUrl =
                uploadInfo.legalDocumentUrl ||
                uploadInfo.legalDocumentUploadUrl ||
                uploadInfo.activityLicenseUrl ||
                uploadInfo.activityLicenseUploadUrl;

              const expectedOtherFiles = form.otherEvidences || [];
              const licenseFile = form.activityLicense;
              const licenseUrl = explicitLicenseUrl;

              const uploads: Array<Promise<void>> = [];

              if (form.managerCidFront) {
                if (!frontUrl)
                  throw new Error('Thiếu URL upload CCCD mặt trước');
                uploads.push(uploadToUrl(frontUrl, form.managerCidFront));
              }
              if (form.managerCidBack) {
                if (!backUrl) throw new Error('Thiếu URL upload CCCD mặt sau');
                uploads.push(uploadToUrl(backUrl, form.managerCidBack));
              }
              if (form.managerCidHolding) {
                if (!holdingUrl)
                  throw new Error('Thiếu URL upload ảnh cầm CCCD');
                uploads.push(uploadToUrl(holdingUrl, form.managerCidHolding));
              }

              if (licenseFile) {
                if (!licenseUrl)
                  throw new Error('Thiếu URL upload giấy phép hoạt động');
                uploads.push(uploadToUrl(licenseUrl, licenseFile));
              }

              for (let i = 0; i < expectedOtherFiles.length; i++) {
                const file = expectedOtherFiles[i];
                const url = otherUrls[i];
                if (!url) {
                  throw new Error(
                    `Thiếu URL upload cho tài liệu chứng minh khác #${i + 1}`
                  );
                }
                uploads.push(uploadToUrl(url, file));
              }

              await Promise.all(uploads);
              // You can add feedback logic here
            } catch (err) {
              // Handle error feedback here
            } finally {
              setUploading(false);
            }
          }}
        >
          <Dialog
            open={openRegistrationHelp}
            onOpenChange={setOpenRegistrationHelp}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Giải thích về Trạng thái đăng ký &amp; Loại tổ chức
                </DialogTitle>
                <DialogDescription>
                  Hướng dẫn chọn đúng nhóm theo tình trạng đăng ký.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <div className="space-y-2">
                  <p className="font-medium text-slate-900 dark:text-white">
                    1) Khi nào chọn “Đã đăng ký”?
                  </p>
                  <p>
                    Nếu tổ chức của bạn đã được đăng ký tại cơ quan quản lý nhà
                    nước về công tác xã hội/các tổ chức (ví dụ cơ quan dân chính
                    địa phương) và có giấy chứng nhận đăng ký do cơ quan đó cấp
                    (như: quỹ, tổ chức cung cấp dịch vụ xã hội, tổ chức/đoàn thể
                    xã hội), hãy chọn <b>Đã đăng ký</b>.
                  </p>
                  <p>
                    Sau đó, <b>Loại tổ chức</b> chọn theo đúng loại ghi trên
                    giấy chứng nhận (một số trường hợp “đơn vị dân lập phi doanh
                    nghiệp” có thể chọn nhóm tương ứng như <b>Tổ chức xã hội</b>
                    tùy theo giấy tờ thực tế).
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-900 dark:text-white">
                    2) Khi nào chọn “Chưa đăng ký”?
                  </p>
                  <p>
                    Các tổ chức còn lại hãy chọn <b>Chưa đăng ký</b>, và chọn{' '}
                    <b>Loại tổ chức</b> theo tình hình thành lập/thực tế hoạt
                    động.
                  </p>
                </div>

                <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Ví dụ chọn loại phù hợp
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <b>Đội tình nguyện Sở/Phòng quản lý thị trường…</b> → chọn{' '}
                      <b>Được thành lập trong cơ quan chính quyền</b>
                    </li>
                    <li>
                      <b>Đội tình nguyện an ninh trật tự của thị trấn/xã…</b> →
                      chọn <b>Tổ chức quần chúng (phường, xã, làng)</b>
                    </li>
                    <li>
                      <b>Đội tình nguyện của thôn/làng…</b> → chọn{' '}
                      <b>Tổ chức quần chúng (phường, xã, làng)</b>
                    </li>
                    <li>
                      <b>CLB/Đoàn thanh niên tình nguyện trong đại học…</b> →
                      chọn <b>Được thành lập trong trường đại học</b>
                    </li>
                    <li>
                      <b>Đội/CLB tình nguyện trong tiểu học/trung học…</b> →
                      chọn <b>Được thành lập trong cơ sở giáo dục phổ thông</b>
                    </li>
                    <li>
                      <b>Đội tình nguyện thuộc doanh nghiệp nhà nước…</b> → chọn{' '}
                      <b>Được thành lập trong doanh nghiệp nhà nước</b>
                    </li>
                    <li>
                      <b>Đội/nhóm tình nguyện thuộc doanh nghiệp tư nhân…</b> →
                      chọn <b>Được thành lập trong doanh nghiệp tư nhân</b>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Ghi chú về “Tổ chức xã hội tự quản”
                  </p>
                  <p>
                    “Tổ chức xã hội tự quản” thường là nhóm/tổ chức tự phát, tự
                    chủ phát triển và tự vận hành; có quy mô nhất định; tồn tại
                    dưới hình thức tổ chức dân sự và dần chuyển từ tự phát sang
                    hoạt động có tổ chức.
                  </p>
                  <p>
                    Nếu không phù hợp với các loại trên, hãy chọn <b>Khác</b>.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Tên tổ chức */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Tên tổ chức <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập tên tổ chức"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Trạng thái đăng ký */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Trạng thái đăng ký <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setOpenRegistrationHelp(true)}
              >
                Chú thích
              </button>
            </div>
            <Select
              value={form.dhaRegistered ? 'registered' : 'unregistered'}
              onValueChange={(val) => {
                const isRegistered = val === 'registered';
                setForm((f) => ({
                  ...f,
                  dhaRegistered: isRegistered,
                  orgType: ''
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">Đã đăng ký</SelectItem>
                <SelectItem value="unregistered">Chưa đăng ký</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loại tổ chức */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Loại tổ chức <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setOpenRegistrationHelp(true)}
              >
                Chú thích
              </button>
            </div>
            <Select
              value={form.orgType}
              onValueChange={(val) =>
                setForm((f) => ({ ...f, orgType: val as EOrgType }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tổ chức" />
              </SelectTrigger>
              <SelectContent>
                {orgTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Giới thiệu về tổ chức */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Giới thiệu về tổ chức <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              rows={3}
              placeholder="Nhập giới thiệu về tổ chức"
              required
              value={form.orgIntroduction || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, orgIntroduction: e.target.value }))
              }
            />
          </div>
          {/* Họ tên quản trị viên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Họ tên quản trị viên <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập họ tên quản trị viên"
              required
              value={form.managerFullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, managerFullName: e.target.value }))
              }
            />
          </div>
          {/* Số CMND/CCCD quản trị viên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Số CMND/CCCD quản trị viên <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập số CMND/CCCD quản trị viên"
              required
              value={form.managerCid}
              onChange={(e) =>
                setForm((f) => ({ ...f, managerCid: e.target.value }))
              }
            />
          </div>
          {/* Số điện thoại quản trị viên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Số điện thoại quản trị viên{' '}
              <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập số điện thoại quản trị viên"
              required
              value={form.managerPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, managerPhone: e.target.value }))
              }
            />
          </div>
          {/* Email quản trị viên + gửi mã xác nhận */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Email quản trị viên <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập email quản trị viên"
                required
                value={form.managerEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, managerEmail: e.target.value }))
                }
              />
            </div>
            <Button
              type="button"
              className="h-10 mt-6"
              disabled={sendingMail || !form.managerEmail}
              onClick={async () => {
                setOtpFeedback(null);
                if (form.managerEmail) {
                  try {
                    const res = await sendVerifyMail(form.managerEmail);
                    setOtpFeedback('success');
                  } catch (err: any) {
                    setOtpFeedback(err?.message || 'Gửi mã thất bại');
                  }
                }
              }}
            >
              {sendingMail ? 'Đang gửi...' : 'Gửi mã'}
            </Button>
          </div>
          <div className="w-full">
            {otpFeedback === 'success' && (
              <div className="text-xs text-green-600 mt-1">
                Mã OTP đã được gửi thành công, vui lòng kiểm tra Email của bạn
              </div>
            )}
            {otpFeedback && otpFeedback !== 'success' && (
              <div className="text-xs text-red-500 -mt-5">{otpFeedback}</div>
            )}
          </div>
          {/* Mã xác minh Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Mã xác minh Email <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập mã xác minh Email"
              required
              value={form.otp}
              onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
            />
          </div>
          {/* Section upload ảnh CMND/CCCD */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Ảnh CMND/CCCD <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mặt trước */}
              <div>
                <div
                  {...getFrontRootProps()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <input {...getFrontInputProps()} />
                  {form.managerCidFront ? (
                    <>
                      {form.managerCidFront.type.startsWith('image') ? (
                        <img
                          src={URL.createObjectURL(form.managerCidFront)}
                          alt="Mặt trước"
                          className="mx-auto mb-2 w-full max-h-48 object-contain rounded"
                        />
                      ) : null}
                      <span className="block text-xs text-green-600">
                        {form.managerCidFront.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Mặt trước</span>
                  )}
                </div>
              </div>
              {/* Mặt sau */}
              <div>
                <div
                  {...getBackRootProps()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <input {...getBackInputProps()} />
                  {form.managerCidBack ? (
                    <>
                      {form.managerCidBack.type.startsWith('image') ? (
                        <img
                          src={URL.createObjectURL(form.managerCidBack)}
                          alt="Mặt sau"
                          className="mx-auto mb-2 w-full max-h-48 object-contain rounded"
                        />
                      ) : null}
                      <span className="block text-xs text-green-600">
                        {form.managerCidBack.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Mặt sau</span>
                  )}
                </div>
              </div>
              {/* Cầm giấy tờ */}
              <div>
                <div
                  {...getHoldingRootProps()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <input {...getHoldingInputProps()} />
                  {form.managerCidHolding ? (
                    <>
                      {form.managerCidHolding.type.startsWith('image') ? (
                        <img
                          src={URL.createObjectURL(form.managerCidHolding)}
                          alt="Cầm giấy tờ"
                          className="mx-auto mb-2 w-full max-h-48 object-contain rounded"
                        />
                      ) : null}
                      <span className="block text-xs text-green-600">
                        {form.managerCidHolding.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Cầm giấy tờ</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Giấy phép hoạt động */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Giấy phép hoạt động <span className="text-red-500">*</span>
            </label>
            <div
              {...getLicenseRootProps()}
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800 min-h-[120px] flex flex-col items-center justify-center"
            >
              <input {...getLicenseInputProps()} />
              {form.activityLicense ? (
                <>
                  {form.activityLicense.type.startsWith('image') ? (
                    <img
                      src={URL.createObjectURL(form.activityLicense)}
                      alt="Giấy phép hoạt động"
                      className="mx-auto mb-2 w-full max-h-48 object-contain rounded"
                    />
                  ) : null}
                  <span className="block text-xs text-green-600">
                    {form.activityLicense.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500">
                  Chọn file ảnh/pdf
                </span>
              )}
            </div>
          </div>
          {/* Tài liệu khác */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Tài liệu chứng minh khác
            </label>
            <div
              {...getOtherRootProps()}
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800 min-h-[120px] flex flex-wrap gap-2 items-center justify-center"
            >
              <input {...getOtherInputProps()} />
              {form.otherEvidences && form.otherEvidences.length > 0 ? (
                form.otherEvidences.map((f, idx) =>
                  f.type && f.type.startsWith('image') ? (
                    <img
                      key={idx}
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full max-h-48 object-contain rounded border"
                    />
                  ) : (
                    <span key={idx} className="block text-xs text-green-600">
                      {f.name}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-slate-500">
                  Chọn file ảnh/pdf
                </span>
              )}
            </div>
          </div>
          {/* Lý do đăng ký */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Lý do đăng ký <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              rows={2}
              placeholder="Nhập lý do đăng ký"
              required
              value={form.applicationReason}
              onChange={(e) =>
                setForm((f) => ({ ...f, applicationReason: e.target.value }))
              }
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={!isFormValid || registering || uploading}
          >
            {registering
              ? 'Đang đăng ký...'
              : uploading
                ? 'Đang tải file...'
                : 'Đăng ký'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
