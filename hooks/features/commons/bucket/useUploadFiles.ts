import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Hàm upload file lên signed URL bằng SDK
async function uploadToSignedUrlSDK(
  bucket: string,
  path: string,
  token: string,
  file: File
) {
  // Kiểm tra dung lượng < 5MB (BR-27)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Dung lượng file vượt quá 5MB' };
  }

  // Kiểm tra định dạng
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
    return { success: false, error: 'Chỉ chấp nhận file JPG hoặc PNG' };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export function useUploadFiles() {
  // Hàm upload 1 file lên 1 signedUrl bằng SDK
  const uploadFileToSignedUrl = useCallback(
    async (file: File, signedUrl: string) => {
      // Parse bucket, path, token từ signedUrl
      try {
        const url = new URL(signedUrl);
        // /object/upload/sign/<bucket>/<path>
        const match = url.pathname.match(
          /\/object\/upload\/sign\/([^/]+)\/(.+)$/
        );
        if (!match) return { success: false, error: 'Sai định dạng signedUrl' };
        const bucket = match[1];
        const path = match[2];
        const token = url.searchParams.get('token');
        if (!token)
          return { success: false, error: 'Thiếu token trong signedUrl' };
        return uploadToSignedUrlSDK(bucket, path, token, file);
      } catch (err: any) {
        return { success: false, error: err?.message || 'Lỗi parse signedUrl' };
      }
    },
    []
  );

  return { uploadFileToSignedUrl };
}
