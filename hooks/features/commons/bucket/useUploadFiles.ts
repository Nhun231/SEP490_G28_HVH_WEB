import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useUploadFiles() {
  const uploadFiles = useCallback(async (file: File, bucket: string) => {
    // Kiểm tra dung lượng < 5MB (BR-27)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Dung lượng file vượt quá 5MB' };
    }

    // Kiểm tra định dạng
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return { success: false, error: 'Chỉ chấp nhận file JPG hoặc PNG' };
    }

    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, file);

    if (uploadError) return { success: false, error: uploadError.message };

    const { data } = supabase.storage.from(bucket).getPublicUrl(uniqueName);
    return { success: true, url: data.publicUrl, supabasePath: uniqueName };
  }, []);

  return { uploadFiles };
}
