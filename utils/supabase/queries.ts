import type { ServerSupabaseClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getUser = cache(async (supabase: ServerSupabaseClient) => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getUserDetails = cache(async (supabase: ServerSupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});
