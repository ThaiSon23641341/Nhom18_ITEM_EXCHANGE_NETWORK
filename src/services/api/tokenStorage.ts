import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'nhom18.session.token';

let memoryToken: string | null = null;

// Synchronous read used by apiRequest on every call.
export const getAuthToken = (): string | null => memoryToken;

// SecureStore has no web implementation, so the browser falls back to localStorage.
const isWeb = Platform.OS === 'web';

export async function loadStoredToken(): Promise<string | null> {
  const stored = isWeb
    ? globalThis.localStorage?.getItem(TOKEN_KEY) ?? null
    : await SecureStore.getItemAsync(TOKEN_KEY);
  memoryToken = stored;
  return stored;
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  if (isWeb) globalThis.localStorage?.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  if (isWeb) globalThis.localStorage?.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}
