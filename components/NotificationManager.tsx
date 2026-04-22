'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useSupabase } from '@/app/supabase-provider';

const NOTIFICATION_REGISTERED_USER_KEY = 'notification_registered_user_id';

export default function NotificationManager() {
  const { supabase } = useSupabase();
  const pathname = usePathname();
  const { requestPermission } = useNotificationPermission();
  const hasTriggeredRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastRegisteredUserIdRef = useRef<string | null>(null);
  const requestPermissionRef = useRef(requestPermission);

  // Always keep the latest requestPermission function
  requestPermissionRef.current = requestPermission;

  const getStoredRegisteredUserId = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(NOTIFICATION_REGISTERED_USER_KEY);
  }, []);

  const resetRegistrationState = useCallback((reason: string) => {
    hasTriggeredRef.current = false;
    isProcessingRef.current = false;
    lastRegisteredUserIdRef.current = null;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(NOTIFICATION_REGISTERED_USER_KEY);
    }
  }, []);

  const getAuthenticatedUserId = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  }, [supabase]);

  const syncRegistrationState = useCallback(
    (currentUserId: string | null) => {
      const storedUserId = getStoredRegisteredUserId();

      if (!currentUserId) {
        resetRegistrationState('no active session');
        return null;
      }

      if (storedUserId && storedUserId !== currentUserId) {
        resetRegistrationState(
          `stored user changed from ${storedUserId} to ${currentUserId}`
        );
      }

      if (
        lastRegisteredUserIdRef.current &&
        lastRegisteredUserIdRef.current !== currentUserId
      ) {
        resetRegistrationState(
          `ref user changed from ${lastRegisteredUserIdRef.current} to ${currentUserId}`
        );
      }

      if (storedUserId === currentUserId) {
        hasTriggeredRef.current = true;
        lastRegisteredUserIdRef.current = currentUserId;
      }

      return currentUserId;
    },
    [getStoredRegisteredUserId, resetRegistrationState]
  );

  const markUserAsRegistered = (userId: string) => {
    hasTriggeredRef.current = true;
    lastRegisteredUserIdRef.current = userId;
    sessionStorage.setItem(NOTIFICATION_REGISTERED_USER_KEY, userId);
  };

  const shouldHandleNotifications =
    pathname.startsWith('/dashboard') || pathname.startsWith('/organizer');

  useEffect(() => {
    if (!shouldHandleNotifications) {
      return;
    }

    const triggerNotificationRegistration = async (
      incomingUserId?: string | null
    ) => {
      const currentUserId = syncRegistrationState(
        incomingUserId ?? (await getAuthenticatedUserId())
      );

      if (!currentUserId) {
        return;
      }

      if (isProcessingRef.current) {
        return;
      }

      if (
        hasTriggeredRef.current &&
        lastRegisteredUserIdRef.current === currentUserId
      ) {
        return;
      }

      isProcessingRef.current = true;

      try {
        const result = await requestPermissionRef.current();

        if (result.permission === 'granted' && !result.token) {
          return;
        }

        markUserAsRegistered(currentUserId);
      } finally {
        isProcessingRef.current = false;
      }
    };

    let isMounted = true;

    // Immediate session check
    const checkSessionImmediately = async () => {
      const currentUserId = await getAuthenticatedUserId();
      syncRegistrationState(currentUserId);

      if (currentUserId && isMounted) {
        await triggerNotificationRegistration(currentUserId);
      }
    };

    // Auth state listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (!isMounted) {
        return;
      }

      if (event === 'SIGNED_IN') {
        const currentUserId = syncRegistrationState(
          await getAuthenticatedUserId()
        );

        if (!currentUserId) {
          return;
        }

        await triggerNotificationRegistration(currentUserId);
      } else if (event === 'SIGNED_OUT') {
        resetRegistrationState('signed out');
      }
    });

    checkSessionImmediately();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [
    supabase,
    getAuthenticatedUserId,
    resetRegistrationState,
    shouldHandleNotifications,
    syncRegistrationState
  ]);

  return null;
}
