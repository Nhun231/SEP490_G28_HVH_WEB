// Boolean toggles to determine which auth types are allowed
const allowPassword = true;

// Boolean toggle to determine whether auth interface should route through server or client
// (Currently set to false because screen sometimes flickers with server redirects)
const allowServerRedirect = false;

if (!allowPassword) throw new Error('Password sign-in must be enabled');

export const getAuthTypes = () => {
  return { allowPassword };
};

export const getViewTypes = () => {
  let viewTypes: string[] = [];
  if (allowPassword) {
    viewTypes = [
      ...viewTypes,
      'password_signin',
      'forgot_password',
      'update_password'
    ];
  }

  return viewTypes;
};

export const getDefaultSignInView = (preferredSignInView: string | null) => {
  let defaultView = 'password_signin';
  if (preferredSignInView && getViewTypes().includes(preferredSignInView)) {
    defaultView = preferredSignInView;
  }

  return defaultView;
};

export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};
