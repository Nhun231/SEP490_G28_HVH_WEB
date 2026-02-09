'use client';

import { useUserRole } from '@/hooks/use-user-role';
import { ROLE_LABELS_VI } from '@/types/roles';
import { Badge } from '@/components/ui/badge';

// Role badge component
export function UserRoleBadge() {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!role) return null;

  const variants = {
    SYS_ADMIN: 'default' as const,
    ORG_MANAGER: 'secondary' as const
  };

  return (
    <Badge variant={variants[role]}>
      {ROLE_LABELS_VI[role]}
    </Badge>
  );
}

// Conditional rendering based on role
interface RoleGuardProps {
  allowedRoles: ('SYS_ADMIN' | 'ORG_MANAGER')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div className="animate-pulse">{fallback}</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Show content only for specific role
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['SYS_ADMIN']}>
      {children}
    </RoleGuard>
  );
}

export function ManagerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ORG_MANAGER']}>
      {children}
    </RoleGuard>
  );
}
