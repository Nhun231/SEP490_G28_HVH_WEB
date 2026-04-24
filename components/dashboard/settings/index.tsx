/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IRoute } from '@/types/types';
import { useGetSysAdmAccountInfo } from '@/hooks/features/sys-admin/uc088-view-profile-by-admin/useGetSysAdmAccountInfo';
import { useUpdateSystemAminProfile } from '@/hooks/features/sys-admin/uc020-update-non-volunteer-profile/useUpdateSystemAminProfile';
import { getFullSupabaseImageUrl } from '@/utils/helpers';
import { useUploadFiles } from '@/hooks/features/commons/bucket/useUploadFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
}

const formatTextValue = (value?: string | null) => {
  if (!value || !value.trim()) {
    return 'Chưa cập nhật';
  }
  return value;
};

const formatDateValue = (value?: string | null) => {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium'
  }).format(date);
};

const formatGenderValue = (value?: boolean | null) => {
  if (value === true) {
    return 'Nam';
  }
  if (value === false) {
    return 'Nữ';
  }
  return 'Chưa cập nhật';
};

export default function Settings(props: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const roleFromAuth = String(
    props.user?.app_metadata?.role ?? ''
  ).toLowerCase();
  const roleFromDetails = String(props.userDetails?.role ?? '').toLowerCase();
  const isAdminView =
    props.colorVariant === 'admin' ||
    roleFromAuth.includes('admin') ||
    roleFromDetails.includes('admin');
  const { data: sysAdmAccountInfo, mutate: refreshAccountInfo } =
    useGetSysAdmAccountInfo({
      baseUrl: apiBaseUrl,
      enabled: isAdminView
    });
  const { trigger: updateProfile, isMutating: isUpdating } =
    useUpdateSystemAminProfile({
      baseUrl: apiBaseUrl
    });
  const { uploadFileToSignedUrl } = useUploadFiles();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAdminApiData = Boolean(isAdminView && sysAdmAccountInfo);

  const displayName = useMemo(() => {
    return hasAdminApiData
      ? formatTextValue(sysAdmAccountInfo?.fullName)
      : 'Chưa cập nhật';
  }, [hasAdminApiData, sysAdmAccountInfo?.fullName]);

  const displayEmail = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.email)
    : 'Chưa cập nhật';
  const displayPhone = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.phone)
    : 'Chưa cập nhật';
  const displayAvatar = hasAdminApiData
    ? getFullSupabaseImageUrl(sysAdmAccountInfo?.avatarUrl) || undefined
    : undefined;

  const displayAdminId = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.id)
    : 'Chưa cập nhật';
  const displayAdminCid = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.cid)
    : 'Chưa cập nhật';
  const displayAdminGender = hasAdminApiData
    ? formatGenderValue(sysAdmAccountInfo?.gender)
    : 'Chưa cập nhật';
  const displayAdminDob = hasAdminApiData
    ? formatDateValue(sysAdmAccountInfo?.dob)
    : 'Chưa cập nhật';
  const displayAdminAddress = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.address)
    : 'Chưa cập nhật';
  const displayAdminDetailAddress = hasAdminApiData
    ? formatTextValue(sysAdmAccountInfo?.detailAddress)
    : 'Chưa cập nhật';

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(
    sysAdmAccountInfo?.fullName
      ? sysAdmAccountInfo.fullName.split(' ')[0] || ''
      : ''
  );
  const [lastName, setLastName] = useState(
    sysAdmAccountInfo?.fullName
      ? sysAdmAccountInfo.fullName.split(' ').slice(1).join(' ') || ''
      : ''
  );
  const [timeZone, setTimeZone] = useState('+7 GMT');
  const [phone, setPhone] = useState(sysAdmAccountInfo?.phone || '');
  const [email, setEmail] = useState(sysAdmAccountInfo?.email || '');
  const [cid, setCid] = useState(sysAdmAccountInfo?.cid || '');
  const [dob, setDob] = useState(sysAdmAccountInfo?.dob || '');
  const [address, setAddress] = useState(sysAdmAccountInfo?.address || '');
  const [detailAddress, setDetailAddress] = useState(
    sysAdmAccountInfo?.detailAddress || ''
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    firstName: sysAdmAccountInfo?.fullName
      ? sysAdmAccountInfo.fullName.split(' ')[0] || ''
      : '',
    lastName: sysAdmAccountInfo?.fullName
      ? sysAdmAccountInfo.fullName.split(' ').slice(1).join(' ') || ''
      : '',
    timeZone: '+7 GMT',
    phone: sysAdmAccountInfo?.phone || '',
    email: sysAdmAccountInfo?.email || '',
    cid: sysAdmAccountInfo?.cid || '',
    dob: sysAdmAccountInfo?.dob || '',
    address: sysAdmAccountInfo?.address || '',
    detailAddress: sysAdmAccountInfo?.detailAddress || ''
  });

  // Update values when data changes
  React.useEffect(() => {
    if (sysAdmAccountInfo?.fullName) {
      const nameParts = sysAdmAccountInfo.fullName.split(' ');
      const firstNameValue = nameParts[0] || '';
      const lastNameValue = nameParts.slice(1).join(' ') || '';
      setFirstName(firstNameValue);
      setLastName(lastNameValue);
      setOriginalValues((prev) => ({
        ...prev,
        firstName: firstNameValue,
        lastName: lastNameValue
      }));
    }
  }, [sysAdmAccountInfo?.fullName]);

  React.useEffect(() => {
    setPhone(sysAdmAccountInfo?.phone || '');
    setEmail(sysAdmAccountInfo?.email || '');
    setOriginalValues((prev) => ({
      ...prev,
      phone: sysAdmAccountInfo?.phone || '',
      email: sysAdmAccountInfo?.email || ''
    }));
  }, [sysAdmAccountInfo?.phone, sysAdmAccountInfo?.email]);

  React.useEffect(() => {
    setCid(sysAdmAccountInfo?.cid || '');
    setOriginalValues((prev) => ({
      ...prev,
      cid: sysAdmAccountInfo?.cid || ''
    }));
  }, [sysAdmAccountInfo?.cid]);

  React.useEffect(() => {
    setDob(sysAdmAccountInfo?.dob || '');
    setOriginalValues((prev) => ({
      ...prev,
      dob: sysAdmAccountInfo?.dob || ''
    }));
  }, [sysAdmAccountInfo?.dob]);

  React.useEffect(() => {
    setAddress(sysAdmAccountInfo?.address || '');
    setDetailAddress(sysAdmAccountInfo?.detailAddress || '');
    setOriginalValues((prev) => ({
      ...prev,
      address: sysAdmAccountInfo?.address || '',
      detailAddress: sysAdmAccountInfo?.detailAddress || ''
    }));
  }, [sysAdmAccountInfo?.address, sysAdmAccountInfo?.detailAddress]);

  const initials =
    displayName && displayName.length > 0
      ? displayName.charAt(0).toUpperCase()
      : displayEmail.charAt(0).toUpperCase();

  const handleEdit = () => {
    if (!isEditing) {
      // Save current values before entering edit mode
      setOriginalValues({
        firstName,
        lastName,
        timeZone,
        phone,
        email,
        cid,
        dob,
        address,
        detailAddress
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    // Reset to original values
    setFirstName(originalValues.firstName);
    setLastName(originalValues.lastName);
    setTimeZone(originalValues.timeZone);
    setPhone(originalValues.phone);
    setEmail(originalValues.email);
    setCid(originalValues.cid);
    setDob(originalValues.dob);
    setAddress(originalValues.address);
    setDetailAddress(originalValues.detailAddress);
    setAvatarPreview(null);
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Debug: log current state values
      console.log('Current state values:', {
        firstName,
        lastName,
        dob,
        address,
        detailAddress
      });

      // Validation: Check required fields
      const newErrors: Record<string, string> = {};
      if (!firstName) {
        newErrors.firstName = 'Vui lòng nhập Họ';
      }
      if (!lastName) {
        newErrors.lastName = 'Vui lòng nhập Tên';
      }
      if (!dob) {
        newErrors.dob = 'Vui lòng nhập Ngày sinh';
      }
      if (!address) {
        newErrors.address = 'Vui lòng nhập Địa chỉ';
      }
      if (!detailAddress) {
        newErrors.detailAddress = 'Vui lòng nhập Địa chỉ chi tiết';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Clear errors if validation passes
      setErrors({});

      // Prepare request data - send all fields regardless of value
      const requestData: any = {
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        dob: dob || '',
        address: address || '',
        detailAddress: detailAddress || ''
      };

      // Handle avatar upload if file is selected
      if (avatarFile) {
        // Extract extension from filename and add dot prefix
        const extension = avatarFile.name.split('.').pop();
        requestData.avatarExtension = extension ? `.${extension}` : '';
      }

      console.log('Request data to send:', requestData);

      // Call the update API
      const response = await updateProfile(requestData);

      console.log('API response:', response);
      console.log('avatarFile:', avatarFile);
      console.log('avatarUploadUrl:', response?.avatarUploadUrl);

      // Upload avatar to Supabase if file is selected and upload URL is provided
      if (avatarFile && response?.avatarUploadUrl) {
        const uploadUrl = response.avatarUploadUrl.startsWith('http')
          ? response.avatarUploadUrl
          : `${SUPABASE_URL?.replace(/\/$/, '')}${response.avatarUploadUrl}`;

        console.log('Uploading avatar to:', uploadUrl);

        await uploadFileToSignedUrl(avatarFile, uploadUrl);
        console.log('Avatar uploaded successfully');
      } else {
        console.log(
          'Skipping avatar upload - avatarFile:',
          !!avatarFile,
          'avatarUploadUrl:',
          !!response?.avatarUploadUrl
        );
      }

      toast.success('Cập nhật hồ sơ thành công!');

      // Revalidate account info to refresh UI with new values
      await refreshAccountInfo();

      setIsEditing(false);
      setAvatarFile(null);
      console.log('Profile saved successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error?.message || 'Cập nhật hồ sơ thất bại!');
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Cài đặt hồ sơ"
      description="Hiển thị thông tin tài khoản từ BE."
      routes={props.routes}
      colorVariant={props.colorVariant}
      signInPath={props.signInPath}
    >
      <div className="mx-auto w-full max-w-5xl pb-16 pt-2">
        <Card className="border-zinc-200 bg-white p-8 shadow-md">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    className={`mx-auto h-40 w-40 border-4 border-white shadow-lg ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage src={avatarPreview || displayAvatar} />
                    <AvatarFallback className="bg-blue-100 text-3xl font-bold text-blue-700">
                      {initials || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-md"
                      onClick={handleAvatarClick}
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="mt-6">
                  {isEditing ? (
                    <div className="flex gap-2 justify-center w-full max-w-xs mx-auto">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mx-auto"
                    >
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Profile Information Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin cá nhân
                </h2>

                <div className="space-y-4">
                  {/* Always show name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        HỌ
                      </label>
                      {isEditing ? (
                        <Input
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setErrors((prev) => ({ ...prev, firstName: '' }));
                          }}
                          placeholder="Chưa cập nhật"
                          className={`border-gray-300 bg-gray-50 ${errors.firstName ? 'border-red-500' : ''}`}
                        />
                      ) : (
                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                          {firstName || 'Chưa cập nhật'}
                        </div>
                      )}
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        TÊN
                      </label>
                      {isEditing ? (
                        <Input
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setErrors((prev) => ({ ...prev, lastName: '' }));
                          }}
                          placeholder="Chưa cập nhật"
                          className={`border-gray-300 bg-gray-50 ${errors.lastName ? 'border-red-500' : ''}`}
                        />
                      ) : (
                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                          {lastName || 'Chưa cập nhật'}
                        </div>
                      )}
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      SỐ ĐIỆN THOẠI
                    </label>
                    {isEditing ? (
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Chưa cập nhật"
                        className="border-gray-300 bg-gray-50"
                      />
                    ) : (
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                        {phone || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      NGÀY SINH
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => {
                          setDob(e.target.value);
                          setErrors((prev) => ({ ...prev, dob: '' }));
                        }}
                        className={`border-gray-300 bg-gray-50 ${errors.dob ? 'border-red-500' : ''}`}
                      />
                    ) : (
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                        {displayAdminDob}
                      </div>
                    )}
                    {errors.dob && (
                      <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                    )}
                  </div>

                  {/* Show CID if exists */}
                  {sysAdmAccountInfo?.cid && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        CĂN CƯỚC CÔNG DÂN
                      </label>
                      {isEditing ? (
                        <Input
                          value={cid}
                          onChange={(e) => setCid(e.target.value)}
                          placeholder="Chưa cập nhật"
                          className="border-gray-300 bg-gray-50"
                        />
                      ) : (
                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                          {cid || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Always show address fields */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      ĐỊA CHỈ
                    </label>
                    {isEditing ? (
                      <Input
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setErrors((prev) => ({ ...prev, address: '' }));
                        }}
                        placeholder="Chưa cập nhật"
                        className={`border-gray-300 bg-gray-50 ${errors.address ? 'border-red-500' : ''}`}
                      />
                    ) : (
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                        {address || 'Chưa cập nhật'}
                      </div>
                    )}
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      ĐỊA CHỈ CHI TIẾT
                    </label>
                    {isEditing ? (
                      <Input
                        value={detailAddress}
                        onChange={(e) => {
                          setDetailAddress(e.target.value);
                          setErrors((prev) => ({ ...prev, detailAddress: '' }));
                        }}
                        placeholder="Chưa cập nhật"
                        className={`border-gray-300 bg-gray-50 ${errors.detailAddress ? 'border-red-500' : ''}`}
                      />
                    ) : (
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                        {detailAddress || 'Chưa cập nhật'}
                      </div>
                    )}
                    {errors.detailAddress && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.detailAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Authentication Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Xác thực
                </h2>

                <div className="space-y-4">
                  {sysAdmAccountInfo?.id && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        ID
                      </label>
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                        {sysAdmAccountInfo.id}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      ĐỊA CHỈ EMAIL
                    </label>
                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                      {sysAdmAccountInfo?.email || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
