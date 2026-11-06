import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { clearToken, getAuthToken, loadStoredToken, saveToken } from './tokenStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });

  test('keeps the token in memory and SecureStore after saving', async () => {
    await saveToken('abc');
    expect(getAuthToken()).toBe('abc');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), 'abc');
  });

  test('loads the stored token into memory', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored');
    await expect(loadStoredToken()).resolves.toBe('stored');
    expect(getAuthToken()).toBe('stored');
  });

  test('clears both copies of the token', async () => {
    await saveToken('abc');
    await clearToken();
    expect(getAuthToken()).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });
});
