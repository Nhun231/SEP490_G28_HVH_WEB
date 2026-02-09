import { redirect } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserWithRole } from '@/utils/supabase/queries';
import { UserRole } from '@/utils/supabase/queries';
import { ROLE_ROUTES } from '@/types/roles';

// Require authentication and optional role-based access
export async function requireAuth(
  supabase: SupabaseClient,
  allowedRoles?: NonNullable<UserRole>[]
) {
  const { user, role } = await getUserWithRole(supabase);

  if (!user || !role) {
    redirect('/dashboard/signin');
  }

  // If specific roles are required, check against them
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to user's default dashboard
    redirect(ROLE_ROUTES[role]);
  }

  return { user, role };
}

// Check if user has access to a specific route
export async function checkRouteAccess(
  supabase: SupabaseClient,
  route: string
): Promise<{ hasAccess: boolean; userRole: UserRole }> {
  const { user, role } = await getUserWithRole(supabase);

  if (!user) {
    return { hasAccess: false, userRole: null };
  }

  // Import canAccessRoute from types/roles
  const { canAccessRoute } = await import('@/types/roles');
  const hasAccess = canAccessRoute(role, route);

  return { hasAccess, userRole: role };
}
