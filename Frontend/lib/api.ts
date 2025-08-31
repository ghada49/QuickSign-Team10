import { fetchAuthSession } from 'aws-amplify/auth';
import { Platform } from 'react-native';

function resolveDefaultBase() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  if (Platform.OS === 'web') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin.includes(':5000') ? origin : 'http://localhost:5000';
  }
  return 'http://192.168.1.106:5000';
}

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE?.trim() || resolveDefaultBase());

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(`API ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function authHeader() {
  const { tokens } = await fetchAuthSession();
  const jwt = tokens?.idToken?.toString(); // Flask validates ID token
  if (!jwt) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${jwt}` };
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = await authHeader();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
    ...auth,
  };

  let body = init.body as any;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    body = JSON.stringify(body);
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers, body });
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const api = {
  get:  <T = any>(path: string) => apiFetch<T>(path),
  post: <T = any>(path: string, json: any) => apiFetch<T>(path, { method: 'POST', body: json }),
  put:  <T = any>(path: string, json: any) => apiFetch<T>(path, { method: 'PUT',  body: json }),
  del:  <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};

console.log('API_BASE =', API_BASE);
