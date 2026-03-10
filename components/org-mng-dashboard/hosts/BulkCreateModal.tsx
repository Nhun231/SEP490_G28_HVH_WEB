'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MdClose, MdUploadFile, MdDownload, MdWarning } from 'react-icons/md';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { createClient } from '@/utils/supabase/client';

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HostData {
  fullName: string;
  email: string;
  phone: string;
  dob: string | null;
  cid: string | null;
  address: string;
  detailAddress: string;
}

export default function BulkCreateModal({ isOpen, onClose }: BulkCreateModalProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<HostData[]>([]);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering (for Portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setParsedData([]);
      setError(null);
      setSuccess(null);
      setIsDragging(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) {
      setError('Không tìm thấy file');
      return;
    }

    // Check file format
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('Dung lượng file vượt quá giới hạn 10MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    setSelectedFile(file);
    parseExcelFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file format
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('Dung lượng file vượt quá giới hạn 10MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    setSelectedFile(file);
    parseExcelFile(file);
  };

  // Parse Excel file and validate data
  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      const hosts: HostData[] = jsonData.map((row: any) => {
        let dob: string | null = null;
        if (row['Ngày sinh']) {
          const dobValue = row['Ngày sinh'];
          if (typeof dobValue === 'number') {
            const date = XLSX.SSF.parse_date_code(dobValue);
            dob = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else if (typeof dobValue === 'string') {
            const ddmmyyyyMatch = dobValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyyMatch) {
              const [, day, month, year] = ddmmyyyyMatch;
              dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else {
              const parsedDate = new Date(dobValue);
              if (!isNaN(parsedDate.getTime())) {
                dob = parsedDate.toISOString().split('T')[0];
              }
            }
          }
        }

        const ward = String(row['Phường/Xã'] || '').trim();
        let formattedAddress = '';
        if (ward) {
          formattedAddress = ward.includes('Hà Nội') ? ward : `Hà Nội, ${ward}`;
        }

        return {
          fullName: String(row['Họ và tên'] || '').trim(),
          email: String(row['Email'] || '').trim(),
          phone: String(row['Số điện thoại'] || '').trim(),
          dob,
          cid: row['Số CCCD'] ? String(row['Số CCCD']).trim() : null,
          address: formattedAddress,
          detailAddress: String(row['Địa chỉ chi tiết'] || '').trim()
        };
      });

      // Validate required fields with specific error messages
      const requiredFieldErrors: string[] = [];
      hosts.forEach((h, index) => {
        const missingFields: string[] = [];
        if (!h.fullName) missingFields.push('Họ và tên');
        if (!h.email) missingFields.push('Email');
        if (!h.dob) missingFields.push('Ngày sinh');
        if (!h.cid) missingFields.push('Số CCCD');
        if (!h.phone) missingFields.push('Số điện thoại');
        if (!h.address) missingFields.push('Phường/Xã');
        if (!h.detailAddress) missingFields.push('Địa chỉ chi tiết');
        
        if (missingFields.length > 0) {
          requiredFieldErrors.push(`Hàng ${index + 2}: Thiếu ${missingFields.join(', ')}`);
        }
      });
      if (requiredFieldErrors.length > 0) {
        setError(requiredFieldErrors.join('\n'));
        return;
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const emailErrors: string[] = [];
      hosts.forEach((h, index) => {
        if (!emailRegex.test(h.email)) {
          emailErrors.push(`Hàng ${index + 2}: Email không đúng định dạng`);
        }
      });
      if (emailErrors.length > 0) {
        setError(emailErrors.join('\n'));
        return;
      }

      // Validate phone format
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
      const phoneErrors: string[] = [];
      hosts.forEach((h, index) => {
        if (!phoneRegex.test(h.phone)) {
          phoneErrors.push(`Hàng ${index + 2}: Số điện thoại không đúng định dạng (phải bắt đầu bằng 0 hoặc +84, theo sau là 3/5/7/8/9 và 8 chữ số)`);
        }
      });
      if (phoneErrors.length > 0) {
        setError(phoneErrors.join('\n'));
        return;
      }

      // Validate detailAddress - no special characters (except , /)
      const addressSpecialCharsRegex = /[!@#$%^&*()_+=\[\]{};:'"<>?\\|`~\-\.]/;
      const addressErrors: string[] = [];
      hosts.forEach((h, index) => {
        if (addressSpecialCharsRegex.test(h.detailAddress)) {
          addressErrors.push(`Hàng ${index + 2}: Địa chỉ chi tiết không được chứa ký tự đặc biệt ngoại trừ dấu phẩy và gạch chéo`);
        }
      });
      if (addressErrors.length > 0) {
        setError(addressErrors.join('\n'));
        return;
      }

      setParsedData(hosts);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
    }
  };

  // Sample excel file for creating multiple host accounts
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên': 'Nguyễn Văn A',
        'Email': 'nguyenvana@example.com',
        'Số điện thoại': '0901234567',
        'Ngày sinh': '15/01/1990',
        'Số CCCD': '001234567890',
        'Phường/Xã': 'Cầu Giấy',
        'Địa chỉ chi tiết': 'Số 123 Đường Xuân Thủy'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách Host');
    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
    XLSX.writeFile(wb, 'Mau_Danh_Sach_Host.xlsx');
  };


  // Handle upload and create host accounts
  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Vui lòng đăng nhập lại.');

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < parsedData.length; i++) {
        try {
          const response = await fetch('/api/hosts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(parsedData[i])
          });

          if (!response.ok) {
            const result = await response.json();
            // Backend error messages are already formatted by API route (from moreInfo)
            const errorMessage = result.error || 'Có lỗi xảy ra';
            
            // Handle multi-line errors from backend
            const errorLines = errorMessage.split('\n');
            if (errorLines.length > 1) {
              // Multiple error messages (e.g., validation errors)
              errors.push(`Hàng ${i + 2}:`); // +2 because Excel row 1 is header, data starts at row 2
              errorLines.forEach(line => {
                if (line.trim()) {
                  errors.push(`  - ${line.trim()}`);
                }
              });
            } else {
              // Single error message
              errors.push(`Hàng ${i + 2}: ${errorMessage}`);
            }
            errorCount++;
            continue;
          }
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(`Tạo thành công ${successCount} tài khoản!`);
        setTimeout(() => {
          onClose();
          router.push('/org-mng-dashboard/hosts');
          router.refresh();
        }, 1500);
      }
      if (errorCount > 0) {
        const errorSummary = `${errors.join('\n')}`;
        setError(errorSummary);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Sử dụng createPortal để đưa Modal lên trên cùng của <body>
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] z-[10000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Thêm tài khoản hàng loạt</h2>
            <p className="text-sm text-white/80 mt-1">Tải lên file Excel để tạo nhiều tài khoản cùng lúc</p>
          </div>
          <button onClick={handleClose} disabled={isUploading} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Section: Download Template */}
          <div className="bg-[#E3F2FD] dark:bg-gray-700/50 rounded-lg p-4 border border-[#90CAF9] dark:border-gray-600">
            <div className="flex items-start gap-3">
              <MdDownload className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tải file mẫu Excel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sử dụng file mẫu để đảm bảo định dạng đúng</p>
                <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-[#42A5F5] hover:bg-[#64B5F6] text-white rounded-lg text-sm font-medium transition-colors">
                  Tải file mẫu
                </button>
              </div>
            </div>
          </div>

          {/* Section: Upload */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tải lên file Excel</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 transition-all duration-200',
                isDragging ? 'border-[#42A5F5] bg-[#E3F2FD] dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
              )}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
                  <MdUploadFile className="text-3xl text-gray-400" />
                </div>
                {selectedFile ? (
                  <div className="space-y-3 w-full">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <button onClick={() => { setSelectedFile(null); setParsedData([]); setError(null); }} className="text-sm text-red-500 hover:text-red-600 font-medium">
                      Xóa file và chọn lại
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-900 dark:text-white font-medium mb-1">Kéo thả file vào đây hoặc nhấp để chọn</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hỗ trợ: .xlsx, .xls (Tối đa 10MB)</p>
                    <label className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg font-medium cursor-pointer">
                      Chọn file
                      <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 p-4 rounded-lg text-green-600 text-sm">{success}</div>}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 max-h-60 overflow-y-auto custom-scrollbar">
                  <pre className="text-sm text-red-800 dark:text-red-200 font-mono whitespace-pre-line">{error}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 p-4 rounded-lg flex gap-3">
            <MdWarning className="text-xl text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Lưu ý: File Excel cần đúng các cột: Họ tên, Email, Số điện thoại, Ngày sinh, CCCD, Phường/Xã, Địa chỉ chi tiết.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={handleClose} disabled={isUploading} className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">Hủy</button>
          <button
            onClick={handleUpload}
            disabled={parsedData.length === 0 || isUploading || !!success}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all text-white',
              parsedData.length > 0 && !isUploading && !success ? 'bg-[#42A5F5] hover:bg-[#64B5F6] shadow-md' : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            {isUploading ? `Đang tạo ${parsedData.length} tài khoản...` : `Tải lên và tạo (${parsedData.length})`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}