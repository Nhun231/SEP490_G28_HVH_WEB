'use client';

import { useState, useEffect } from 'react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<HostData[]>([]);

  // Reset state when modal closes
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

  if (!isOpen) return null;

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
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      parseExcelFile(file);
    } else {
      setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      parseExcelFile(file);
    }
  };

  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Parse and validate data
      const hosts: HostData[] = jsonData.map((row: any) => {
        // Parse date of birth
        let dob: string | null = null;
        if (row['Ngày sinh']) {
          const dobValue = row['Ngày sinh'];
          if (typeof dobValue === 'number') {
            // Excel date serial number
            const date = XLSX.SSF.parse_date_code(dobValue);
            dob = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else if (typeof dobValue === 'string') {
            // Try to parse string date
            const parsedDate = new Date(dobValue);
            if (!isNaN(parsedDate.getTime())) {
              dob = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            }
          }
        }

        // Get ward/district from Excel column "Phường/Xã"
        const ward = String(row['Phường/Xã'] || '').trim();
        // Format address with "Hà Nội, " prefix
        let formattedAddress = '';
        if (ward) {
          formattedAddress = ward.includes('Hà Nội') ? ward : `Hà Nội, ${ward}`;
        }

        return {
          fullName: String(row['Họ và tên'] || '').trim(),
          email: String(row['Email'] || '').trim(),
          phone: String(row['Số điện thoại'] || '').trim(),
          dob,
          cid: row['Số CCCD/CMND'] ? String(row['Số CCCD/CMND']).trim() : null,
          address: formattedAddress,
          detailAddress: String(row['Địa chỉ chi tiết'] || '').trim()
        };
      });

      // Validate required fields (after trimming)
      const invalidRows = hosts.filter(h => !h.fullName || !h.email || !h.phone || !h.address || !h.detailAddress);
      if (invalidRows.length > 0) {
        setError(`Có ${invalidRows.length} hàng thiếu thông tin bắt buộc (Họ tên, Email, SĐT, Phường/Xã, Địa chỉ chi tiết)`);
        return;
      }

      // Validate phone format: ^(0|\+84)(3|5|7|8|9)\d{8}$
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
      const invalidPhones = hosts.filter(h => !phoneRegex.test(h.phone));
      if (invalidPhones.length > 0) {
        setError(`Có ${invalidPhones.length} số điện thoại không đúng định dạng (phải bắt đầu bằng 0 hoặc +84, theo sau là 3/5/7/8/9 và 8 chữ số)`);
        return;
      }

      setParsedData(hosts);
      console.log('Parsed hosts:', hosts);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        'Họ và tên': 'Nguyễn Văn A',
        'Email': 'nguyenvana@example.com',
        'Số điện thoại': '0901234567',
        'Ngày sinh': '1990-01-15',
        'Số CCCD/CMND': '001234567890',
        'Phường/Xã': 'Cầu Giấy',
        'Địa chỉ chi tiết': 'Số 123 Đường Xuân Thủy'
      },
      {
        'Họ và tên': 'Trần Thị B',
        'Email': 'tranthib@example.com',
        'Số điện thoại': '0912345678',
        'Ngày sinh': '1995-05-20',
        'Số CCCD/CMND': '001234567891',
        'Phường/Xã': 'Hoàng Mai',
        'Địa chỉ chi tiết': 'Số 456 Phố Giải Phóng'
      }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách Host');

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Họ và tên
      { wch: 25 }, // Email
      { wch: 15 }, // SĐT
      { wch: 12 }, // Ngày sinh
      { wch: 15 }, // CCCD
      { wch: 15 }, // Phường/Xã
      { wch: 30 }  // Địa chỉ chi tiết
    ];

    // Generate and download
    XLSX.writeFile(wb, 'Mau_Danh_Sach_Host.xlsx');
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setError('Không có dữ liệu để tải lên');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get Supabase session token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Create hosts one by one using the single create API
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < parsedData.length; i++) {
        try {
          const response = await fetch('/api/hosts/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(parsedData[i])
          });

          // Check if response is ok (200-299)
          if (!response.ok) {
            const result = await response.json();
            const errorMessage = result.error || result.message || 'Có lỗi xảy ra';
            errors.push(`Hàng ${i + 1}: ${errorMessage}`);
            errorCount++;
            continue;
          }

          // Parse response (could be JSON or plain text)
          const contentType = response.headers.get('content-type');
          let result;
          
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            const text = await response.text();
            result = { message: text };
          }

          // Check for duplicate email even with 200 status
          const resultText = JSON.stringify(result).toLowerCase();
          if (resultText.includes('duplicate') || resultText.includes('already exists') || resultText.includes('tồn tại')) {
            errors.push(`Hàng ${i + 1}: Email đã tồn tại`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(`Hàng ${i + 1}: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
          errorCount++;
        }
      }

      // Display results
      if (successCount > 0 && errorCount === 0) {
        setSuccess(`Tạo thành công ${successCount} tài khoản host!`);
      } else if (successCount > 0 && errorCount > 0) {
        setSuccess(`Tạo thành công ${successCount} tài khoản host.`);
        setError(`Có ${errorCount} lỗi:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      } else {
        setError(`Tất cả ${errorCount} tài khoản đều thất bại:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      }
      
      // Only refresh and close if we have at least one success
      if (successCount > 0) {
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show new hosts
        }, 2000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải lên file. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Thêm tài khoản hàng loạt</h2>
            <p className="text-sm text-white/80 mt-1">Tải lên file Excel để tạo nhiều tài khoản cùng lúc</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdClose className="text-2xl text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Download Template Section */}
          <div className="bg-[#E3F2FD] dark:bg-gray-700/50 rounded-lg p-4 border border-[#90CAF9] dark:border-gray-600">
            <div className="flex items-start gap-3">
              <MdDownload className="text-2xl text-[#42A5F5] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Tải file mẫu Excel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Sử dụng file mẫu để đảm bảo định dạng đúng
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-[#42A5F5] hover:bg-[#64B5F6] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Tải file mẫu
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Tải lên file Excel
            </h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 transition-all duration-200',
                isDragging
                  ? 'border-[#42A5F5] bg-[#E3F2FD] dark:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
              )}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
                  <MdUploadFile className="text-3xl text-gray-400" />
                </div>
                
                {selectedFile ? (
                  <div className="space-y-3 w-full">
                    <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      {parsedData.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            ✓ {parsedData.length} tài khoản
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setParsedData([]);
                        setError(null);
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Xóa file và chọn lại
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                      Kéo thả file vào đây hoặc nhấp để chọn
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Hỗ trợ: .xlsx, .xls (Tối đa 10MB)
                    </p>
                    <label className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors cursor-pointer">
                      Chọn file
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <MdWarning className="text-xl text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Lưu ý:
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  File Excel cần có các cột: Họ tên, Email, Số điện thoại, Ngày sinh (YYYY-MM-DD), 
                  Số CCCD/CMND, Phường/Xã (ví dụ: Cầu Giấy, Hoàng Mai), 
                  Địa chỉ chi tiết (số nhà, tên đường).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          
          <button
            onClick={handleUpload}
            disabled={parsedData.length === 0 || isUploading || !!success}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
              parsedData.length > 0 && !isUploading && !success
                ? 'bg-[#42A5F5] hover:bg-[#64B5F6] text-white shadow-md'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang tạo {parsedData.length} tài khoản...</span>
              </>
            ) : (
              <span>Tải lên và tạo ({parsedData.length})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
