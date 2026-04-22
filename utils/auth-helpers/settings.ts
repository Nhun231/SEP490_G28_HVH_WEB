// Boolean toggles to determine which auth types are allowed
const allowPassword = true;

// Boolean toggle to determine whether auth interface should route through server or client
// (Currently set to false because screen sometimes flickers with server redirects)
const allowServerRedirect = false;

export const SIGN_IN_VIEW_TYPES = [
  'password_signin',
  'forgot_password',
  'update_password'
] as const;

export type SignInView = (typeof SIGN_IN_VIEW_TYPES)[number];

if (!allowPassword) throw new Error('Password sign-in must be enabled');

export const getAuthTypes = () => {
  return { allowPassword };
};

export const getViewTypes = () => {
  return allowPassword ? [...SIGN_IN_VIEW_TYPES] : [];
};

export const isSignInView = (view: unknown): view is SignInView => {
  return (
    typeof view === 'string' && SIGN_IN_VIEW_TYPES.includes(view as SignInView)
  );
};

export const getDefaultSignInView = (preferredSignInView: string | null) => {
  let defaultView = 'password_signin';
  if (preferredSignInView && isSignInView(preferredSignInView)) {
    defaultView = preferredSignInView;
  }

  return defaultView;
};

export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};
