// src/api/client.ts
import ky, { KyInstance, Options, BeforeRequestHook, AfterResponseHook, ResponsePromise } from 'ky';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://rahal-back-end.vercel.app/api/v1';

// Token storage
export const setAuthToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('auth_token', token);
  } catch {
    // Web fallback - use localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
};

// Store for hooks (will be set after stores are created)
let useAuthStoreRef: { getState: () => any } | null = null;

export const setAuthStoreRef = (store: { getState: () => any }) => {
  useAuthStoreRef = store;
};

const beforeRequestHook: BeforeRequestHook = async ({ request }) => {
  const token = await getAuthToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  request.headers.set('Accept', 'application/json');
  request.headers.set('Content-Type', 'application/json');
};

const afterResponseHook: AfterResponseHook = async ({ response }) => {
  if (response.status === 401 && useAuthStoreRef) {
    // Token expired or invalid
    useAuthStoreRef.getState().logout();
  }
  return response;
};

class APIClient {
  private client: KyInstance;

  constructor() {
    this.client = ky.create({
      prefix: API_URL,
      timeout: 60000,
      hooks: {
        beforeRequest: [beforeRequestHook],
        afterResponse: [afterResponseHook],
      },
    });
  }

  get(url: string, options?: Options): ResponsePromise {
    return this.client.get(url, options);
  }

  post(url: string, options?: Options): ResponsePromise {
    return this.client.post(url, options);
  }

  patch(url: string, options?: Options): ResponsePromise {
    return this.client.patch(url, options);
  }

  put(url: string, options?: Options): ResponsePromise {
    return this.client.put(url, options);
  }

  delete(url: string, options?: Options): ResponsePromise {
    return this.client.delete(url, options);
  }

  getRawClient(): KyInstance {
    return this.client;
  }
}

export const api = new APIClient();

export const extractApiErrorMessage = async (
  error: any,
  fallbackMessage: string = 'An unexpected error occurred'
): Promise<string> => {
  if (error?.response) {
    try {
      const errData = await error.response.clone().json();
      return errData.message || errData.error || fallbackMessage;
    } catch {
      return error.message || fallbackMessage;
    }
  }
  return error?.message || fallbackMessage;
};