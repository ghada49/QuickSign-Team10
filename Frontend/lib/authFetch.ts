import { fetchAuthSession } from 'aws-amplify/auth';
import { getIdToken } from './authToken';

export async function authFetch(url: string, init: RequestInit = {}) {
  const doFetch = (token: string) =>
    fetch(url, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    });

  let token = await getIdToken();
  if (!token) {
    await fetchAuthSession({ forceRefresh: true });
    token = await getIdToken();
  }
  if (!token) throw new Error('No auth session');

  let res = await doFetch(token);

  if (res.status === 401) {
    await fetchAuthSession({ forceRefresh: true });
    const token2 = await getIdToken();
    if (token2) res = await doFetch(token2);
  }

  return res;
}
