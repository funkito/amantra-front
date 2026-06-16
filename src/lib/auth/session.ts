import { cookies } from 'next/headers';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
  isAdminRole,
  verifySessionToken,
} from '@/lib/auth/token';

export {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
  isAdminRole,
  verifySessionToken,
};

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(token);
}
