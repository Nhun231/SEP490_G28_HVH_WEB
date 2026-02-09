import { UserRole } from '@/utils/supabase/queries';

// Default route for each role
export const ROLE_ROUTES: Record<NonNullable<UserRole>, string> = {
  SYS_ADMIN: '/dashboard/main',
  ORG_MANAGER: '/org-mng-dashboard'
};

// Route permissions - which roles can access which routes
export const ROUTE_PERMISSIONS: Record<string, NonNullable<UserRole>[]> = {
  '/dashboard/main': ['SYS_ADMIN'],
  '/org-mng-dashboard': ['ORG_MANAGER'],
  '/org-mng-dashboard/hosts': ['ORG_MANAGER'],
  '/org-mng-dashboard/events': ['ORG_MANAGER'],
  '/org-mng-dashboard/pending-approval': ['ORG_MANAGER'],
  '/org-mng-dashboard/reports': ['ORG_MANAGER'],
  '/org-mng-dashboard/settings': ['ORG_MANAGER'],
  '/dashboard/organizers-list': ['SYS_ADMIN'],
  '/dashboard/volunteers-list': ['SYS_ADMIN'],
  '/dashboard/pending-events': ['SYS_ADMIN'],
  '/dashboard/pending-approval': ['SYS_ADMIN'],
  '/dashboard/event-settings': ['SYS_ADMIN'],
  '/dashboard/settings': ['SYS_ADMIN'],
  '/dashboard/ai-chat': ['SYS_ADMIN']
};

// Check if a role has access to a route
export function canAccessRoute(role: UserRole, route: string): boolean {
  if (!role) return false;
  
  // Find matching route pattern
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(pattern => 
    route.startsWith(pattern)
  );

  if (!matchingRoute) {
    // Route not in config → allow all logged-in users
    return true;
  }

  return ROUTE_PERMISSIONS[matchingRoute].includes(role);
}

// Display labels for each role
export const ROLE_LABELS_VI: Record<NonNullable<UserRole>, string> = {
  SYS_ADMIN: 'Quản trị viên hệ thống',
  ORG_MANAGER: 'Quản lý tổ chức'
};

// Welcome messages
export const ROLE_WELCOME_MESSAGES_VI: Record<NonNullable<UserRole>, string> = {
  SYS_ADMIN: 'Chào mừng Quản trị viên!',
  ORG_MANAGER: 'Chào mừng Quản lý tổ chức!'
};
