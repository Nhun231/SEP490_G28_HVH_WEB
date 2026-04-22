import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getDefaultSignInView,
  getRedirectMethod,
  isSignInView
} from '@/utils/auth-helpers/settings';

export default async function SignIn({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { allowPassword } = getAuthTypes();
  const redirectMethod = getRedirectMethod();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (resolvedParams.id === 'signup') {
    return notFound();
  }

  const status =
    typeof resolvedSearchParams.status === 'string'
      ? resolvedSearchParams.status
      : undefined;
  const statusDescription =
    typeof resolvedSearchParams.status_description === 'string'
      ? resolvedSearchParams.status_description
      : undefined;
  const error =
    typeof resolvedSearchParams.error === 'string'
      ? resolvedSearchParams.error
      : undefined;
  const errorDescription =
    typeof resolvedSearchParams.error_description === 'string'
      ? resolvedSearchParams.error_description
      : undefined;
  const disableButton = resolvedSearchParams.disable_button === 'true';

  let viewProp: string;

  if (isSignInView(resolvedParams.id)) {
    viewProp = resolvedParams.id;
  } else {
    const cookieStore = await cookies();
    const preferredSignInView =
      cookieStore.get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/dashboard/signin/${viewProp}`);
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/dashboard/main');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/dashboard/signin');
  }

  return (
    <DefaultAuth viewProp={viewProp} variant="admin">
      <div>
        <AuthUI
          viewProp={viewProp}
          user={user}
          allowPassword={allowPassword}
          redirectMethod={redirectMethod}
          disableButton={disableButton}
          status={status}
          statusDescription={statusDescription}
          error={error}
          errorDescription={errorDescription}
          isAdmin={true}
        />
      </div>
    </DefaultAuth>
  );
}
