'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdPerson, MdEmail, MdPhone, MdCalendarToday, MdCreditCard, MdLocationOn, MdHome, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    idCard: string;
    address: string;
    detailAddress: string;
}

export default function CreateHostForm() {
    const router = useRouter();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        idCard: '',
        address: '',
        detailAddress: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            // Get Supabase session token
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }

            // Validate required fields
            const trimmedAddress = formData.address.trim();
            const trimmedDetailAddress = formData.detailAddress.trim();
            const trimedFullName = formData.fullName.trim();
            const trimmedEmail = formData.email.trim();
            const trimmedPhone = formData.phone.trim();
            const trimmedIdCard = formData.idCard.trim();
            const trimmedDob = formData.dateOfBirth.trim();

            if (!trimmedAddress) {
                throw new Error('Vui lòng chọn Phường/Xã');
            }

            if (!trimmedDetailAddress) {
                throw new Error('Vui lòng điền địa chỉ chi tiết');
            }

            if (!trimedFullName) {
                throw new Error('Vui lòng điền họ và tên');
            }

            if (!trimmedEmail) {
                throw new Error('Vui lòng điền email');
            }

            if (!trimmedPhone) {
                throw new Error('Vui lòng điền số điện thoại');
            }

            if (!trimmedDob) {
                throw new Error('Vui lòng chọn ngày sinh');
            }

            if (!trimmedIdCard) {
                throw new Error('Vui lòng điền CCCD');
            }

            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(trimmedEmail)) {
                throw new Error('Email không đúng định dạng (ví dụ: example@domain.com)');
            }

            // Validate phone format: ^(0|\+84)(3|5|7|8|9)\d{8}$
            const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                throw new Error('Số điện thoại không đúng định dạng (phải bắt đầu bằng 0 hoặc +84, theo sau là 3/5/7/8/9 và 8 chữ số)');
            }

            // Validate detailAddress
            const addressSpecialCharsRegex = /[!@#$%^&*()_+=\[\]{};:'"<>?\\|`~\-\.]/;
            if (addressSpecialCharsRegex.test(trimmedDetailAddress)) {
                throw new Error('Địa chỉ chi tiết không được chứa ký tự đặc biệt ngoại trừ dấu phẩy và gạch chéo');
            }

            // Format address with "Hà Nội, " prefix
            const formattedAddress = trimmedAddress ? `Hà Nội, ${trimmedAddress}` : null;

            // Format date of birth to YYYY-MM-DD if present
            let formattedDob = null;
            if (trimmedDob) {
                // Ensure it's in YYYY-MM-DD format
                const date = new Date(trimmedDob);
                if (!isNaN(date.getTime())) {
                    formattedDob = trimmedDob; // Already in YYYY-MM-DD from date input
                }
            }

            // Prepare payload matching API schema
            const payload = {
                fullName: trimedFullName,
                email: trimmedEmail,
                phone: trimmedPhone,
                dob: formattedDob,
                cid: trimmedIdCard || null,
                address: formattedAddress,
                detailAddress: trimmedDetailAddress
            };

            console.log('Sending payload to API:', payload);

            const response = await fetch('/api/hosts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('API Response:', result);

            if (!response.ok) {
                // Get error message from response
                const errorMessage = result.error || result.message || 'Có lỗi xảy ra khi tạo tài khoản';

                // Throw the actual error message from backend
                throw new Error(errorMessage);
            }

            // Success
            setSuccess('Tạo tài khoản host thành công!');

            // Wait a moment to show success message, then redirect
            setTimeout(() => {
                router.push('/org-mng-dashboard/hosts');
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error('Error creating host:', err);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/org-mng-dashboard/hosts');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            {error.split('\n').map((line, index) => (
                                <p key={index} className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* Form Fields */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Thông tin cơ bản</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Họ và tên */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên đầy đủ"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@domain.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="0901234567"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Ngày sinh */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ngày sinh <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Số CCCD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Số CCCD <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="idCard"
                                        value={formData.idCard}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số CCCD"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Phường/Xã */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phường/Xã <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        <option value="Cầu Giấy">Cầu Giấy</option>
                                        <option value="Dịch Vọng">Dịch Vọng</option>
                                        <option value="Mai Dịch">Mai Dịch</option>
                                        <option value="Nghĩa Đô">Nghĩa Đô</option>
                                        <option value="Nghĩa Tân">Nghĩa Tân</option>
                                        <option value="Quân Thánh">Quân Thánh</option>
                                        <option value="Trúc Bạch">Trúc Bạch</option>
                                        <option value="Yên Hòa">Yên Hòa</option>
                                        <option value="Hoàng Mai">Hoàng Mai</option>
                                        <option value="Thanh Xuân">Thanh Xuân</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Địa chỉ chi tiết - Full width */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MdHome className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        name="detailAddress"
                                        value={formData.detailAddress}
                                        onChange={handleInputChange}
                                        placeholder="Số nhà, tên đường..."
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] dark:bg-gray-700 dark:text-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Confirmation Checkbox - Inside form */}
                            <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={isConfirmed}
                                            onChange={(e) => setIsConfirmed(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border-2 transition-all duration-200",
                                            isConfirmed
                                                ? "bg-[#42A5F5] border-[#42A5F5]"
                                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-[#42A5F5]"
                                        )}>
                                            {isConfirmed && (
                                                <MdCheckCircle className="w-full h-full text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Tôi xác nhận rằng tất cả thông tin trên đều chính xác và đúng sự thật
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Việc cung cấp thông tin sai lệch có thể dẫn đến việc khóa tài khoản
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hủy
                    </span>
                </button>

                <button
                    type="submit"
                    disabled={!isConfirmed || isSubmitting || !!success}
                    className={cn(
                        "px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                        isConfirmed && !isSubmitting && !success
                            ? "bg-[#42A5F5] hover:bg-[#64B5F6] text-white shadow-md hover:shadow-lg"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang tạo...</span>
                        </>
                    ) : (
                        <>
                            <MdCheckCircle className="text-xl" />
                            <span>Tạo tài khoản</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
