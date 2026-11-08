import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import AppointmentsTab from '../app/(tabs)/appointments';
import * as tokenStorage from '../services/api/tokenStorage';
import authReducer from '../store/authSlice';
import { useAppBootstrap } from './useAppBootstrap';
import { useReminderSyncController } from './useReminderSyncController';

jest.mock('../services/api/tokenStorage');
jest.mock('../services/authService');
jest.mock('./useReminderSyncController', () => ({
  useReminderSyncController: jest.fn(),
}));
jest.mock('../views/screens/AppointmentsScreen', () => ({
  AppointmentsScreen: () => {
    const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
    return <MockText>Lịch hẹn</MockText>;
  },
}));

function NavigationGate() {
  const { isRestoring } = useAppBootstrap();
  return isRestoring ? <Text>Đang khôi phục</Text> : <AppointmentsTab />;
}

test('opening appointments does not restart session restoration', async () => {
  jest.mocked(tokenStorage.loadStoredToken).mockReset();
  jest.mocked(tokenStorage.loadStoredToken).mockResolvedValue(null);
  const store = configureStore({ reducer: { auth: authReducer } });

  await render(
    <Provider store={store}>
      <NavigationGate />
    </Provider>,
  );

  await waitFor(() => expect(screen.getByText('Lịch hẹn')).toBeTruthy());
  expect(store.getState().auth.isRestoring).toBe(false);
  expect(tokenStorage.loadStoredToken).toHaveBeenCalledTimes(1);
  expect(useReminderSyncController).toHaveBeenCalled();
});
