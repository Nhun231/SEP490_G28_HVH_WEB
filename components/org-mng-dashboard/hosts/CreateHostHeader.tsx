'use client';

import { useState } from 'react';
import { MdUploadFile } from 'react-icons/md';
import BulkCreateModal from './BulkCreateModal';

export default function CreateHostHeader() {
  const [showBulkModal, setShowBulkModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Tạo tài khoản Host mới
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Điền đầy đủ thông tin chi tiết
          </p>
        </div>
        
        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-[#42A5F5] text-[#42A5F5] rounded-lg font-medium hover:bg-[#E3F2FD] dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <MdUploadFile className="text-xl" />
          <span>Tạo hàng loạt</span>
        </button>
      </div>

      <BulkCreateModal 
        isOpen={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
      />
    </>
  );
}
