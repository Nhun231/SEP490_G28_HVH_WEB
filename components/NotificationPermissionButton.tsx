'use client';

import { useNotificationPermission } from '@/hooks/use-notification-permission';

export function NotificationPermissionButton() {
  const { permission, isSupported, requestPermission, isLoading } =
    useNotificationPermission();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const getButtonText = () => {
    if (isLoading) return 'Đang yêu cầu quyền...';
    switch (permission) {
      case 'granted':
        return 'Quyền thông báo đã được cấp';
      case 'denied':
        return 'Quyền thông báo bị từ chối';
      case 'default':
        return 'Yêu cầu quyền thông báo';
      case 'unsupported':
        return 'Trình duyệt không hỗ trợ';
      default:
        return 'Yêu cầu quyền thông báo';
    }
  };

  const getButtonColor = () => {
    switch (permission) {
      case 'granted':
        return 'bg-green-600 hover:bg-green-700';
      case 'denied':
        return 'bg-red-600 hover:bg-red-700';
      case 'unsupported':
        return 'bg-gray-400 cursor-not-allowed';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Trình duyệt không hỗ trợ thông báo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Trạng thái:</span>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            permission === 'granted'
              ? 'bg-green-100 text-green-800'
              : permission === 'denied'
                ? 'bg-red-100 text-red-800'
                : permission === 'default'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {permission === 'granted'
            ? 'Đã cấp quyền'
            : permission === 'denied'
              ? 'Từ chối'
              : permission === 'default'
                ? 'Chưa quyết định'
                : 'Không hỗ trợ'}
        </span>
      </div>

      <button
        onClick={handleRequestPermission}
        disabled={
          permission === 'granted' || permission === 'unsupported' || isLoading
        }
        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${getButtonColor()} ${
          permission === 'granted' || permission === 'unsupported' || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        {getButtonText()}
      </button>

      {permission === 'denied' && (
        <p className="text-sm text-red-600">
          Để bật thông báo, vui lòng vào cài đặt trình duyệt và cho phép thông
          báo cho trang web này.
        </p>
      )}
    </div>
  );
}
