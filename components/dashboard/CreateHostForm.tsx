'use client';
import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useCreateHostAccount } from '@/hooks/features/uc067-create-host-account/useCreateHostAccount';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateHostForm({ user, userDetails, routes }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    idNumber: '',
    ward: '',
    address: '',
    agree: false
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const { trigger, isMutating, data, error } = useCreateHostAccount({
    baseUrl: apiBaseUrl
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      cid: form.idNumber,
      email: form.email,
      phone: form.phone,
      fullName: form.name,
      dob: form.dob,
      address: form.ward,
      detailAddress: form.address
    };
    try {
      const res = await trigger(payload);
      toast.success('Tạo tài khoản Host thành công!');
      // TODO: reset form hoặc chuyển trang nếu cần
    } catch (err: any) {
      toast.error(err?.message || 'Tạo tài khoản Host thất bại!');
    }
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      routes={routes}
      colorVariant="organizer"
      title="Tạo tài khoản Host mới"
      description="Điền đầy đủ thông tin chi tiết"
    >
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
          onClick={() => router.push('/organizer/host-management')}
        >
          Quay lại
        </Button>
      </div>

      <div className="max-w-full mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
          <Button
            type="button"
            variant="outline"
            className="font-semibold border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-2 shadow"
            onClick={() =>
              router.push('/organizer/host-management/bulk-create-host')
            }
          >
            <Upload className="w-4 h-4" />
            Tạo tài khoản hàng loạt
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Họ và tên
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên đầy đủ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Email
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="example@domain.com"
                type="email"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Số điện thoại
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="0901234567"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Ngày sinh
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="dob"
                value={form.dob}
                onChange={handleChange}
                type="date"
                required
                placeholder="Chọn ngày sinh"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Số CCCD/CMND
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                required
                placeholder="Nhập số CCCD/CMND"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Phường/Xã
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="ward"
              value={form.ward}
              onChange={handleChange}
              required
              placeholder="Chọn Phường/Xã"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Địa chỉ chi tiết
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Nhập số nhà, tên đường..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              name="agree"
              checked={form.agree}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  agree: checked === true
                }))
              }
            />
            <span className="text-sm">
              Tôi xác nhận rằng tất cả thông tin tôi cung cấp ở trên là chính
              xác và đúng sự thật
            </span>
          </div>
          <div className="flex justify-end w-full space-x-3 mt-6">
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                !form.agree ||
                !form.name.trim() ||
                !form.email.trim() ||
                !form.phone.trim() ||
                !form.dob.trim() ||
                !form.idNumber.trim() ||
                !form.ward.trim() ||
                !form.address.trim() ||
                isMutating
              }
            >
              {isMutating ? 'Đang tạo...' : 'Tạo tài khoản Host'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
