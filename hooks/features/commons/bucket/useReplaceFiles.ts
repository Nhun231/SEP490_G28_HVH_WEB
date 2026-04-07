import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useReplaceFiles() {
  const replaceFile = useCallback(
    async (oldFilePath: string, newFile: File, bucket: string) => {
      const ext = newFile.name.split('.').pop()?.toLowerCase();
      const newPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(newPath, newFile);

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      if (oldFilePath) {
        const removeRes = await supabase.storage
          .from(bucket)
          .remove([oldFilePath]);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(newPath);
      return { success: true, url: data.publicUrl, supabasePath: newPath };
    },
    []
  );

  return { replaceFile };
}
