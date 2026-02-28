import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useUploadFiles() {
  // Upload a single file or array of files to a bucket
  const uploadFiles = useCallback(
    async (
      files: File | File[],
      bucket: string,
      folder: string = 'org-register'
    ): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
      const fileArray = Array.isArray(files) ? files : [files];
      const urls: string[] = [];
      for (const file of fileArray) {
        // Tên file: tên gốc + timestamp
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const fileName = `${baseName}_${timestamp}.${ext}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            upsert: true
          });
        if (error) {
          return { success: false, error: error.message };
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }
      return { success: true, urls };
    },
    []
  );

  return { uploadFiles };
}
