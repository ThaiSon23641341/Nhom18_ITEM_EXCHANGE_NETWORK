import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ApiClientError } from '../services/api/apiClient';
import * as tokenStorage from '../services/api/tokenStorage';
import * as authService from '../services/authService';
import authReducer from '../store/authSlice';
import { useSessionBootstrap } from './useSessionBootstrap';

jest.mock('../services/api/tokenStorage');
jest.mock('../services/authService');

const user = { id: 'user-001' } as never;

const setup = async () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  await renderHook(() => useSessionBootstrap(), { wrapper });
  return { store };
};

describe('useSessionBootstrap', () => {
  beforeEach(() => jest.resetAllMocks());

  test('restores the user from a stored token', async () => {
    jest.mocked(tokenStorage.loadStoredToken).mockResolvedValue('tok');
    jest.mocked(authService.fetchSession).mockResolvedValue(user);
    const { store } = await setup();
    await waitFor(() => expect(store.getState().auth.user).toEqual(user));
    expect(store.getState().auth.isRestoring).toBe(false);
  });

  test('stays signed out when there is no token', async () => {
    jest.mocked(tokenStorage.loadStoredToken).mockResolvedValue(null);
    const { store } = await setup();
    await waitFor(() => expect(store.getState().auth.isRestoring).toBe(false));
    expect(store.getState().auth.user).toBeNull();
    expect(authService.fetchSession).not.toHaveBeenCalled();
  });

  test('drops a rejected token but keeps one when the server is unreachable', async () => {
    jest.mocked(tokenStorage.loadStoredToken).mockResolvedValue('tok');
    jest.mocked(authService.fetchSession).mockRejectedValueOnce(
      new ApiClientError('expired', 'UNAUTHORIZED', 401),
    );
    const rejected = await setup();
    await waitFor(() => expect(rejected.store.getState().auth.isRestoring).toBe(false));
    expect(tokenStorage.clearToken).toHaveBeenCalledTimes(1);

    jest.mocked(authService.fetchSession).mockRejectedValueOnce(
      new ApiClientError('offline', 'NETWORK_ERROR', 0),
    );
    const offline = await setup();
    await waitFor(() => expect(offline.store.getState().auth.isRestoring).toBe(false));
    expect(tokenStorage.clearToken).toHaveBeenCalledTimes(1);
  });
});
