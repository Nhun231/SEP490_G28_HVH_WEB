'use client';
import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { organizerRoutes } from '@/components/routes';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';
import { swrFetcher } from '@/utils/swr-fetcher';
import type { CreateHostAccountRequest } from '@/hooks/dto/host';
import * as XLSX from 'xlsx';
import { useCreateHostAccount } from '@/hooks/features/uc067-create-host-account/useCreateHostAccount';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function BulkCreateHostPage({ user, userDetails, routes }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelRows, setExcelRows] = useState<any[][]>([]);
  const { trigger: createHostAccount } = useCreateHostAccount({
    baseUrl: NEXT_PUBLIC_API_BASE_URL
  });

  const EXPECTED_HEADERS = [
    'Họ và tên',
    'Email',
    'Số điện thoại',
    'Ngày sinh',
    'Số CCCD/CMND',
    'Phường/Xã',
    'Địa chỉ chi tiết'
  ];

  // Hàm kiểm tra một dòng có phải là dòng dữ liệu hợp lệ không
  const isValidDataRow = (row: any[]): boolean => {
    if (!Array.isArray(row)) return false;

    // Chuyển tất cả các ô thành string để kiểm tra
    const rowText = row
      .map((cell) => cell?.toString().toLowerCase() || '')
      .join(' ');

    // Bỏ qua nếu dòng chứa các từ khóa của phần hướng dẫn
    const ignoreKeywords = [
      'lưu ý',
      'hướng dẫn',
      'quan trọng',
      'định dạng',
      'email phải',
      'số điện thoại phải',
      'không được để trống',
      'trùng lặp',
      'tệp tin',
      'template'
    ];

    if (ignoreKeywords.some((keyword) => rowText.includes(keyword))) {
      return false;
    }

    // Bỏ qua nếu dòng có quá ít ô (ví dụ chỉ có 1-2 ô có dữ liệu)
    const nonEmptyCells = row.filter(
      (cell) =>
        cell !== undefined && cell !== null && cell.toString().trim() !== ''
    ).length;

    if (nonEmptyCells < 3) return false;

    // Bỏ qua nếu cột đầu tiên (Họ tên) chứa từ khóa không phải tên người
    const firstName = row[0]?.toString().toLowerCase() || '';
    if (
      firstName.includes('lưu ý') ||
      firstName.includes('hướng dẫn') ||
      firstName.includes('quan trọng') ||
      firstName.includes('ví dụ')
    ) {
      return false;
    }

    return true;
  };

  // Hàm kiểm tra định dạng từng trường
  const validateField = (
    fieldName: string,
    value: any,
    rowIndex: number
  ): string | null => {
    const stringValue = value?.toString().trim() || '';

    switch (fieldName) {
      case 'Họ và tên': {
        const fullNameRegex = /^[A-ZÀ-Ỹ][a-zà-ỹ]*(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]*)*$/;
        if (!stringValue)
          return `Dòng ${rowIndex}: Họ và tên không được để trống`;
        if (stringValue.length > 100)
          return `Dòng ${rowIndex}: Họ và tên không được vượt quá 100 ký tự`;
        if (!fullNameRegex.test(stringValue)) {
          return `Dòng ${rowIndex}: Họ và tên không đúng định dạng (phải viết hoa chữ cái đầu mỗi từ)`;
        }
        break;
      }

      case 'Email': {
        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!stringValue) return `Dòng ${rowIndex}: Email không được để trống`;
        if (!emailRegex.test(stringValue)) {
          return `Dòng ${rowIndex}: Email không đúng định dạng (vd: example@domain.com)`;
        }
        break;
      }

      case 'Số điện thoại': {
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
        if (!stringValue)
          return `Dòng ${rowIndex}: Số điện thoại không được để trống`;
        if (!phoneRegex.test(stringValue)) {
          return `Dòng ${rowIndex}: Số điện thoại không đúng định dạng (vd: 0912345678 hoặc +84912345678)`;
        }
        break;
      }

      case 'Ngày sinh': {
        if (value === '' || value === undefined || value === null) return null; // Cho phép trống

        let date: Date | null = null;
        let isValidDate = false;

        // Nếu là Date object (Excel có thể trả về Date object)
        if (value instanceof Date && !isNaN(value.getTime())) {
          date = value;
          isValidDate = true;
        } else if (typeof value === 'number') {
          // Nếu là số serial Excel (ngày Excel)
          // Excel serial date: ngày 1/1/1900 là 1
          const excelEpochTime = new Date(1899, 11, 30).getTime();
          const ms = excelEpochTime + value * 24 * 60 * 60 * 1000;
          date = new Date(ms);
          isValidDate = !isNaN(date.getTime());
        } else if (typeof value === 'string') {
          const str = value.trim();
          // dd/mm/yyyy
          const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
          const ddmmyyyyMatch = str.match(ddmmyyyyRegex);
          if (ddmmyyyyMatch) {
            const day = parseInt(ddmmyyyyMatch[1]);
            const month = parseInt(ddmmyyyyMatch[2]);
            const year = parseInt(ddmmyyyyMatch[3]);
            date = new Date(year, month - 1, day);
            isValidDate =
              date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day;
          }
          // yyyy-mm-dd
          if (!isValidDate) {
            const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
            const yyyymmddMatch = str.match(yyyymmddRegex);
            if (yyyymmddMatch) {
              const year = parseInt(yyyymmddMatch[1]);
              const month = parseInt(yyyymmddMatch[2]);
              const day = parseInt(yyyymmddMatch[3]);
              date = new Date(year, month - 1, day);
              isValidDate =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day;
            }
          }
        }

        if (!isValidDate || !date) {
          return `Dòng ${rowIndex}: Ngày sinh không đúng định dạng (DD/MM/YYYY hoặc YYYY-MM-DD)`;
        }

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          age--;
        }

        if (age < 18) {
          return `Dòng ${rowIndex}: Người dùng phải từ 18 tuổi trở lên`;
        }

        if (age > 100) {
          return `Dòng ${rowIndex}: Ngày sinh không hợp lệ (tuổi > 100)`;
        }
        break;
      }

      case 'Số CCCD/CMND': {
        if (stringValue === '') return null;
        const cidRegex = /^\d{12}$/;
        if (!cidRegex.test(stringValue)) {
          return `Dòng ${rowIndex}: Số CCCD/CMND phải là 12 chữ số`;
        }
        break;
      }

      case 'Phường/Xã': {
        if (stringValue === '') return null;
        if (stringValue.length > 50) {
          return `Dòng ${rowIndex}: Phường/Xã không được vượt quá 50 ký tự`;
        }
        break;
      }

      case 'Địa chỉ chi tiết': {
        if (stringValue === '') return null;
        if (stringValue.length > 100) {
          return `Dòng ${rowIndex}: Địa chỉ chi tiết không được vượt quá 100 ký tự`;
        }
        break;
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Tìm dòng header
        let headerRowIndex = -1;
        let dataStartIndex = -1;

        for (let i = 0; i < json.length; i++) {
          const row = json[i] as any[];
          if (!Array.isArray(row)) continue;

          // Tìm dòng header
          const rowText = row
            .map((cell) => cell?.toString().trim() || '')
            .join('|');
          if (
            rowText.includes('Họ và tên') &&
            rowText.includes('Email') &&
            rowText.includes('Số điện thoại')
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          setExcelError('Không tìm thấy dòng header trong file Excel');
          setFile(null);
          return;
        }

        const headers = json[headerRowIndex] as string[];

        // Kiểm tra header có đúng định dạng không
        const isValidHeader =
          headers &&
          headers.length === EXPECTED_HEADERS.length &&
          headers.every((h, idx) => h?.trim() === EXPECTED_HEADERS[idx]);

        if (!isValidHeader) {
          setExcelError(
            'File Excel không đúng định dạng header. Vui lòng tải file mẫu để sử dụng.'
          );
          setFile(null);
          return;
        }

        // Lấy dữ liệu từ sau dòng header, lọc bỏ các dòng không phải dữ liệu
        const allRowsAfterHeader = json.slice(headerRowIndex + 1);
        const dataRows = allRowsAfterHeader.filter((row) =>
          isValidDataRow(row as any[])
        );

        if (dataRows.length === 0) {
          setExcelError(
            'Không tìm thấy dữ liệu hợp lệ trong file. Vui lòng kiểm tra lại.'
          );
          setFile(null);
          return;
        }

        // Kiểm tra tất cả các cột đều bắt buộc (không được để trống)
        const emptyRequiredRows: { row: number; cols: string[] }[] = [];
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i] as any[];
          const actualRowNumber =
            headerRowIndex +
            1 +
            allRowsAfterHeader.findIndex((r) => r === row) +
            1;
          const missingCols: string[] = [];
          for (let colIdx = 0; colIdx < EXPECTED_HEADERS.length; colIdx++) {
            const val = row[colIdx];
            let isEmpty = false;
            if (val === undefined || val === null) {
              isEmpty = true;
            } else if (typeof val === 'string' && val.trim() === '') {
              isEmpty = true;
            }
            // Nếu là số hoặc Date thì luôn coi là có dữ liệu (Excel ngày sinh)
            if (isEmpty) {
              missingCols.push(EXPECTED_HEADERS[colIdx]);
            }
          }
          if (missingCols.length > 0) {
            emptyRequiredRows.push({ row: actualRowNumber, cols: missingCols });
          }
        }
        if (emptyRequiredRows.length > 0) {
          const msg = emptyRequiredRows
            .map((r) => `Dòng ${r.row} thiếu: ${r.cols.join(', ')}`)
            .join('; ');
          setExcelError('Có dòng bị thiếu thông tin bắt buộc: ' + msg);
          setFile(null);
          return;
        }

        // Kiểm tra trùng lặp
        const emails = dataRows
          .map((row) => row[1]?.toString().trim())
          .filter(Boolean);
        const phones = dataRows
          .map((row) => row[2]?.toString().trim())
          .filter(Boolean);
        const cccds = dataRows
          .map((row) => row[4]?.toString().trim())
          .filter(Boolean);

        const findDuplicate = (arr: string[]) =>
          arr.filter((item, idx) => arr.indexOf(item) !== idx);

        const duplicateEmails = [...new Set(findDuplicate(emails))];
        const duplicatePhones = [...new Set(findDuplicate(phones))];
        const duplicateCCCDs = [...new Set(findDuplicate(cccds))];

        if (duplicateEmails.length > 0) {
          setExcelError(
            'Có giá trị Email bị trùng trong file: ' +
              duplicateEmails.join(', ')
          );
          setFile(null);
          return;
        }
        if (duplicatePhones.length > 0) {
          setExcelError(
            'Có giá trị Số điện thoại bị trùng trong file: ' +
              duplicatePhones.join(', ')
          );
          setFile(null);
          return;
        }
        if (duplicateCCCDs.length > 0) {
          setExcelError(
            'Có giá trị Số CCCD/CMND bị trùng trong file: ' +
              duplicateCCCDs.join(', ')
          );
          setFile(null);
          return;
        }

        // Kiểm tra định dạng từng trường
        const validationErrors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i] as any[];
          const actualRowNumber =
            headerRowIndex +
            1 +
            allRowsAfterHeader.findIndex((r) => r === row) +
            1;

          for (let colIdx = 0; colIdx < EXPECTED_HEADERS.length; colIdx++) {
            const fieldName = EXPECTED_HEADERS[colIdx];
            const value = row[colIdx];
            const error = validateField(fieldName, value, actualRowNumber);
            if (error) {
              validationErrors.push(error);
            }
          }
        }

        if (validationErrors.length > 0) {
          const errorMsg = validationErrors.slice(0, 5).join('\n');
          const remainingCount = validationErrors.length - 5;
          setExcelError(
            `Phát hiện lỗi định dạng:\n${errorMsg}${
              remainingCount > 0 ? `\n... và ${remainingCount} lỗi khác` : ''
            }`
          );
          setFile(null);
          return;
        }

        setFile(selectedFile);
        setExcelRows(dataRows as any[][]);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (excelError || !file || excelRows.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    let failRows: { row: number; error: string }[] = [];
    // Prepare result rows for export
    const resultRows: any[][] = [];
    for (let i = 0; i < excelRows.length; i++) {
      const row = excelRows[i];
      const req: CreateHostAccountRequest = {
        fullName: row[0]?.toString().trim() || '',
        email: row[1]?.toString().trim() || '',
        phone: row[2]?.toString().trim() || '',
        dob: row[3] ? parseExcelDate(row[3]) || '' : '',
        cid: row[4]?.toString().trim() || '',
        address: row[5]?.toString().trim() || '',
        detailAddress: row[6]?.toString().trim() || ''
      };
      let resultMsg = '';
      try {
        await createHostAccount(req);
        successCount++;
        resultMsg = 'Tạo tài khoản thành công';
      } catch (err: any) {
        failCount++;
        const msg = err?.message || 'Unknown error';
        failRows.push({ row: i + 2, error: msg });
        resultMsg = `Thất bại: ${msg}`;
      }
      // Add original row + result message
      resultRows.push([...row, resultMsg]);
    }
    setUploading(false);
    // Export result Excel
    try {
      const exportHeaders = [...EXPECTED_HEADERS, 'Kết quả tạo tài khoản'];
      const exportData = [exportHeaders, ...resultRows];
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kết quả');
      XLSX.writeFile(wb, 'ket_qua_tao_tai_khoan.xlsx');
    } catch (e) {
      toast.error('Không thể xuất file kết quả.');
    }
    if (failCount === 0) {
      toast.success(`Tải lên thành công ${successCount} tài khoản!`);
    } else {
      toast.error(
        `Tải lên thành công ${successCount} tài khoản.\n${failCount} dòng lỗi.\n${failRows.map((r) => `Dòng ${r.row}: ${r.error}`).join('\n')}`
      );
    }
    setFile(null);
    setExcelRows([]);
  };

  // Helper: parse Excel date to yyyy-mm-dd string
  function parseExcelDate(value: any): string | undefined {
    if (value instanceof Date && !isNaN(value.getTime())) {
      // Format to yyyy-mm-dd
      return value.toISOString().slice(0, 10);
    } else if (typeof value === 'number') {
      // Excel serial date
      const excelEpochTime = new Date(1899, 11, 30).getTime();
      const ms = excelEpochTime + value * 24 * 60 * 60 * 1000;
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    } else if (typeof value === 'string') {
      // Try to parse string
      const str = value.trim();
      // dd/mm/yyyy
      const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const ddmmyyyyMatch = str.match(ddmmyyyyRegex);
      if (ddmmyyyyMatch) {
        const day = parseInt(ddmmyyyyMatch[1]);
        const month = parseInt(ddmmyyyyMatch[2]);
        const year = parseInt(ddmmyyyyMatch[3]);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 10);
        }
      }
      // yyyy-mm-dd
      const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
      const yyyymmddMatch = str.match(yyyymmddRegex);
      if (yyyymmddMatch) {
        const year = parseInt(yyyymmddMatch[1]);
        const month = parseInt(yyyymmddMatch[2]);
        const day = parseInt(yyyymmddMatch[3]);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 10);
        }
      }
    }
    return undefined;
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/HVH_mo_tai_khoan.xlsx';
    link.download = 'HVH_mo_tai_khoan.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      routes={organizerRoutes}
      colorVariant="organizer"
      title="Thêm tài khoản hàng loạt"
      description="Tải lên file Excel để tạo nhiều tài khoản cùng lúc"
    >
      <div className="max-w-full mx-auto mt-8">
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
        <div>
          <Card className="border-zinc-200 bg-white p-8 text-zinc-900 shadow-sm">
            <div className="mb-4 flex justify-start">
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                onClick={handleDownloadTemplate}
              >
                <Upload className="w-4 h-4" />
                Tải file mẫu
              </Button>
            </div>
            <div className="mb-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200/90 w-full">
                <div className="font-medium mb-2 text-zinc-800 flex items-center gap-2">
                  Tải lên file Excel
                </div>
                <div
                  className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <div className="text-gray-500 mb-1 font-medium text-base text-center">
                    Kéo thả file vào đây hoặc nhấp để chọn
                  </div>
                  <div className="text-xs text-gray-400 mb-2 text-center">
                    Hỗ trợ: .xlsx, .xls (Tối đa 10MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {excelError && (
                    <div className="mt-2 text-sm text-red-600 font-semibold whitespace-pre-line">
                      {excelError}
                    </div>
                  )}
                  {file && !excelError && (
                    <div className="mt-2 text-sm text-green-600">
                      Đã chọn: {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-3 text-sm">
                <b>Lưu ý:</b> File Excel cần chứa các cột: Họ và tên, Email, Số
                điện thoại, Ngày sinh, Số CCCD/CMND, Phường/Xã, Địa chỉ chi
                tiết. Hệ thống sẽ tự động tạo mật khẩu và gửi qua email.
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                type="button"
                onClick={() => {
                  setFile(null);
                  setExcelError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={!file || uploading || !!excelError}
                onClick={handleUpload}
              >
                {uploading ? 'Đang tải lên...' : 'Tải lên và tạo'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
