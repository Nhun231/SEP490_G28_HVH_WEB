import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type UserRole = 'SYS_ADMIN' | 'ORG_MANAGER' | null;

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

// get user with role from JWT
export const getUserWithRole = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  console.log('User data:', {
    userId: user?.id,
    email: user?.email,
    app_metadata: user?.app_metadata,
    user_metadata: user?.user_metadata
  });
  
  if (!user) {
    return { user: null, role: null };
  }
  
  const role = (user.app_metadata?.role as UserRole) || null;
  
  return { user, role };
});

// get user profile 
export const getUserProfile = cache(async (supabase: SupabaseClient) => {
  const { user, role } = await getUserWithRole(supabase);
  
  if (!user || !role) {
    console.log('No user or role found');
    return { user: null, role: null, profile: null };
  }
  
  let profile = null;
  
  try {
    switch (role) {
      case 'SYS_ADMIN':
        console.log('Querying sys_admins table for user:', user.id);
        const { data: adminData, error: adminError } = await supabase
          .from('sys_admins')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (adminError) {
          console.error('Error fetching admin profile:', adminError);
        } else {
          console.log('Admin profile fetched:', adminData);
        }
        profile = adminData;
        break;
        
      case 'ORG_MANAGER':
        console.log('Querying org_managers table for user:', user.id);
        const { data: managerData, error: managerError } = await supabase
          .from('org_managers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (managerError) {
          console.error('Error fetching manager profile:', managerError);
        } else {
          console.log('Manager profile fetched:', managerData);
        }
        profile = managerData;
        break;
        
      default:
        console.log('Unknown role:', role);
    }
  } catch (error) {
    console.error('Exception in getUserProfile:', error);
  }
  
  console.log('getUserProfile - Returning:', {
    hasUser: !!user,
    role,
    hasProfile: !!profile,
    profileData: profile
  });
  
  return { user, role, profile };
});
