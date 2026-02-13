export const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1')}=([^;]*)`
    )
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const swrFetcher = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const cookieKey = process.env.NEXT_PUBLIC_SUPABASE_AUTH_COOKIE_NAME!;
  const rawCookie = getCookieValue(cookieKey);

  let token = null;

  if (rawCookie && rawCookie.startsWith('base64-')) {
    try {
      const base64Data = rawCookie.replace('base64-', '');
      const decodedData = JSON.parse(atob(base64Data));
      token = decodedData.access_token;
    } catch (e) {
      console.error('Error decoding Supabase auth cookie:', e);
    }
  }

  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');

  // Automatically set Content-Type for POST/PUT/PATCH with body
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'same-origin'
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Request failed');
    }

    const errorText = await response.text().catch(() => 'Request failed');
    throw new Error(errorText || 'Request failed');
  }

  if (isJson) {
    try {
      return (await response.json()) as T;
    } catch (error) {
      const fallbackText = await response.text().catch(() => '');
      if (fallbackText) {
        return fallbackText as T;
      }
      throw error;
    }
  }

  return response.text() as Promise<T>;
};
