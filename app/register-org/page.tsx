'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useSendRegisterOrgVerifyMail } from '@/hooks/features/uc016-register-organization/useSendRegisterOrgVerifyMail';
import { useDropzone } from 'react-dropzone';

export default function RegisterOrgPage() {
  const {
    trigger: sendVerifyMail,
    isMutating: sendingMail,
    error: sendMailError
  } = useSendRegisterOrgVerifyMail();
  const [form, setForm] = useState({
    name: '',
    dhaRegistered: '',
    orgType: '',
    managerFullName: '',
    managerCid: '',
    managerPhone: '',
    managerEmail: '',
    otp: '',
    managerCidFront: null,
    managerCidBack: null,
    managerCidHolding: null,
    otherEvidences: [],
    applicationReason: ''
  });

  // Dropzone for CMND/CCCD images
  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: (files) => setForm((f) => ({ ...f, managerCidFront: files[0] }))
    });
  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } =
    useDropzone({
      accept: { 'image/*': [] },
      maxFiles: 1,
      onDrop: (files) => setForm((f) => ({ ...f, managerCidBack: files[0] }))
    });
  const {
    getRootProps: getHoldingRootProps,
    getInputProps: getHoldingInputProps
  } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => setForm((f) => ({ ...f, managerCidHolding: files[0] }))
  });
  // Dropzone for other evidences
  const { getRootProps: getOtherRootProps, getInputProps: getOtherInputProps } =
    useDropzone({
      accept: { 'image/*': [], 'application/pdf': [] },
      maxFiles: 5,
      onDrop: (files) => setForm((f) => ({ ...f, otherEvidences: files }))
    });

  // Required fields validation
  const isFormValid =
    form.name &&
    form.managerFullName &&
    form.managerCid &&
    form.managerPhone &&
    form.managerEmail &&
    form.otp &&
    form.managerCidFront &&
    form.managerCidBack &&
    form.managerCidHolding &&
    form.applicationReason;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 py-12">
      <Card className="w-full max-w-2xl p-8 border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">
          Đăng ký tổ chức
        </h2>
        <form className="space-y-6">
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
                if (form.managerEmail) {
                  await sendVerifyMail(form.managerEmail);
                }
              }}
            >
              {sendingMail ? 'Đang gửi...' : 'Gửi mã'}
            </Button>
            {sendMailError && (
              <div className="text-xs text-red-500 mt-1">
                {sendMailError.message}
              </div>
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
            Đăng ký
          </Button>
        </form>
      </Card>
    </div>
  );
}
