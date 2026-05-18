function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

export function getBackendApiUrl() {
  const configuredUrl =
    process.env.AMANTRA_BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_AMANTRA_BACKEND_API_URL;

  return configuredUrl ? normalizeBaseUrl(configuredUrl) : null;
}

export function resolveBackendAssetUrl(assetPath?: string | null) {
  if (!assetPath) {
    return assetPath ?? '';
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const baseUrl = getBackendApiUrl();

  if (!baseUrl) {
    return assetPath;
  }

  const backendOrigin = new URL(baseUrl).origin;
  return `${backendOrigin}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

export async function fetchBackendApi<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const baseUrl = getBackendApiUrl();

  if (!baseUrl) {
    throw new Error('External backend API is not configured');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | { ok?: boolean; data?: T; error?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Backend request failed: ${response.status}`);
  }

  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    throw new Error('Backend response did not contain a data payload');
  }

  return payload.data as T;
}
