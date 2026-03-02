/* eslint-disable @next/next/no-img-element */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useReplaceFiles } from '@/hooks/features/commons/bucket/useReplaceFiles';
import { useRegisterOrg } from '@/hooks/features/uc016-register-organization/useRegisterOrg';
import { useSendRegisterOrgVerifyMail } from '@/hooks/features/uc016-register-organization/useSendRegisterOrgVerifyMail';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function RegisterOrgPage() {
  const { replaceFile } = useReplaceFiles();
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
  const [form, setForm] = useState({
    otp: '',
    name: '',
    dhaRegistered: false,
    orgType: '',
    orgIntroduction: '',
    managerFullName: '',
    managerCid: '',
    managerPhone: '',
    managerEmail: '',
    managerCidFrontExtension: '',
    managerCidBackExtension: '',
    managerCidHoldingExtension: '',
    otherEvidencesExtensions: '',
    applicationReason: '',
    // File upload helper fields
    managerCidFront: null as File | null,
    managerCidFrontPath: '',
    managerCidBack: null as File | null,
    managerCidBackPath: '',
    managerCidHolding: null as File | null,
    managerCidHoldingPath: '',
    activityLicense: null as File | null,
    activityLicensePath: '',
    otherEvidences: [],
    otherEvidencesPaths: [] as string[]
  });

  // Dropzone for CMND/CCCD images
  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: async (files) => {
        const file = files[0];
        if (!file) return;
        const oldPath = form.managerCidFrontPath;
        const result = await replaceFile(oldPath, file, 'org-register');
        if (result.success) {
          setForm((f) => ({
            ...f,
            managerCidFront: file,
            managerCidFrontPath: result.supabasePath
          }));
        } else {
          // TODO: handle error (show toast...)
        }
      }
    });
  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: async (files) => {
        const file = files[0];
        if (!file) return;
        const oldPath = form.managerCidBackPath;
        const result = await replaceFile(oldPath, file, 'org-register');
        if (result.success) {
          setForm((f) => ({
            ...f,
            managerCidBack: file,
            managerCidBackPath: result.supabasePath
          }));
        } else {
          // TODO: handle error (show toast...)
        }
      }
    });
  const {
    getRootProps: getHoldingRootProps,
    getInputProps: getHoldingInputProps
  } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      const oldPath = form.managerCidHoldingPath;
      const result = await replaceFile(oldPath, file, 'org-register');
      if (result.success) {
        setForm((f) => ({
          ...f,
          managerCidHolding: file,
          managerCidHoldingPath: result.supabasePath
        }));
      } else {
        // TODO: handle error (show toast...)
      }
    }
  });

  // Dropzone for operating license
  const {
    getRootProps: getLicenseRootProps,
    getInputProps: getLicenseInputProps
  } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      const oldPath = form.activityLicensePath;
      const result = await replaceFile(oldPath, file, 'org-register');
      if (result.success) {
        setForm((f) => ({
          ...f,
          activityLicense: file,
          activityLicensePath: result.supabasePath
        }));
      } else {
        // TODO: handle error (show toast...)
      }
    }
  });
  // Dropzone for other evidences
  const { getRootProps: getOtherRootProps, getInputProps: getOtherInputProps } =
    useDropzone({
      accept: { 'image/*': [], 'application/pdf': [] },
      maxFiles: 5,
      onDrop: async (files) => {
        const uploadedFiles: File[] = [];
        const supabasePaths: string[] = [];
        // Get old file paths array, if not exist then create empty array
        const oldPaths = Array.isArray(form.otherEvidencesPaths)
          ? form.otherEvidencesPaths
          : [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const oldPath = oldPaths[i] || '';
          const result = await replaceFile(oldPath, file, 'org-register');
          if (result.success && result.supabasePath) {
            uploadedFiles.push(file);
            supabasePaths.push(result.supabasePath);
          } else {
            supabasePaths.push(oldPath);
          }
        }
        setForm((f) => ({
          ...f,
          otherEvidences: uploadedFiles,
          otherEvidencesPaths: supabasePaths
        }));
      }
    });

  // Required fields validation
  const isFormValid =
    form.name &&
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 py-12">
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
              const bucket = 'org-register';
              const prefix = (p: string) =>
                p ? (p.startsWith(bucket + '/') ? p : `${bucket}/${p}`) : '';
              const otherEvidencePaths = Array.isArray(form.otherEvidencesPaths)
                ? form.otherEvidencesPaths.map(prefix)
                : [];
              const mergedEvidencePaths = [
                form.activityLicensePath
                  ? prefix(form.activityLicensePath)
                  : '',
                ...otherEvidencePaths
              ].filter(Boolean);
              await registerOrg({
                otp: form.otp,
                name: form.name,
                dhaRegistered: form.dhaRegistered,
                orgType: form.orgType,
                orgIntroduction: form.orgIntroduction,
                managerFullName: form.managerFullName,
                managerCid: form.managerCid,
                managerPhone: form.managerPhone,
                managerEmail: form.managerEmail,
                managerCidFrontExtension: prefix(form.managerCidFrontPath),
                managerCidBackExtension: prefix(form.managerCidBackPath),
                managerCidHoldingExtension: prefix(form.managerCidHoldingPath),
                otherEvidencesExtensions: mergedEvidencePaths.join(','),
                applicationReason: form.applicationReason
              });
              // You can add feedback logic here
            } catch (err) {
              // Handle error feedback here
            }
          }}
        >
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
          <Button type="submit" className="w-full mt-6" disabled={!isFormValid}>
            {registering ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
