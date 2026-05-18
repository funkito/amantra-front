import { getBackendApiUrl } from '@/lib/backend-api';

type BackendLoginResponse = {
  ok: boolean;
  data?: {
    token: string;
  };
};

let cachedAccessToken: string | null = null;

function getRequiredBackendApiUrl() {
  const apiUrl = getBackendApiUrl();

  if (!apiUrl) {
    throw new Error('La API MariaDB no está configurada en este entorno.');
  }

  return apiUrl;
}

function getBackendAdminCredentials() {
  const email =
    process.env.AMANTRA_BACKEND_ADMIN_EMAIL ??
    (process.env.NODE_ENV !== 'production' ? 'admin@amantra.demo' : undefined);
  const password =
    process.env.AMANTRA_BACKEND_ADMIN_PASSWORD ??
    (process.env.NODE_ENV !== 'production' ? 'secret123' : undefined);

  if (!email || !password) {
    throw new Error('Faltan las credenciales del admin MariaDB para el panel.');
  }

  return { email, password };
}

async function loginToBackend() {
  const apiUrl = getRequiredBackendApiUrl();
  const credentials = getBackendAdminCredentials();
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No fue posible autenticar el panel contra MariaDB.');
  }

  const data = (await response.json()) as BackendLoginResponse;
  const token = data.data?.token;

  if (!token) {
    throw new Error('La autenticación MariaDB no devolvió un token válido.');
  }

  cachedAccessToken = token;
  return token;
}

async function getBackendAccessToken(forceRefresh = false) {
  if (cachedAccessToken && !forceRefresh) {
    return cachedAccessToken;
  }

  return loginToBackend();
}

export async function fetchBackendAdminApi(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true
) {
  const apiUrl = getRequiredBackendApiUrl();
  const token = await getBackendAccessToken();
  const headers = new Headers(init.headers);

  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const nextToken = await getBackendAccessToken(true);
    headers.set('Authorization', `Bearer ${nextToken}`);

    return fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  }

  return response;
}

export async function uploadProductImagesToBackend(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  formData.set('folder', 'products');

  for (const file of files) {
    formData.append('images', file);
  }

  const response = await fetchBackendAdminApi('/media/images', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    data?: Array<{ relativePath: string }>;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'No fue posible subir imágenes a MariaDB.');
  }

  return (payload.data ?? []).map((image) => image.relativePath);
}
