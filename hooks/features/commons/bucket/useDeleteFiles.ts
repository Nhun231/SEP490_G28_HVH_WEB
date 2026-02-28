import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useDeleteFiles() {
  // Xóa một hoặc nhiều file trong bucket
  const deleteFiles = useCallback(
    async (
      filePaths: string | string[],
      bucket: string
    ): Promise<{ success: boolean; error?: string }> => {
      const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    },
    []
  );

  return { deleteFiles };
}
