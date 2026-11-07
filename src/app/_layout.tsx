/**
 * src/app/_layout.tsx
 *
 * Root layout — điểm vào của Expo Router.
 * Bọc toàn app với: GestureHandlerRootView, TamaguiProvider, StatusBar.
 * Theme chọn theo chế độ sáng/tối của hệ thống qua useColorScheme.
 *
 * CLO2: dùng useMemo, useCallback (+ useColorScheme từ React Native)
 * CLO5: TamaguiProvider với theme light/dark, không ghi cứng màu.
 */
/**f */

import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '../../tamagui.config';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppBootstrap } from '../controllers/useAppBootstrap';

function AppNavigator() {
  const { isRestoring } = useAppBootstrap();
  const screenOptions = useCallback(
    () => ({
      headerShown: false,
    }),
    [],
  );

  if (isRestoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={screenOptions()} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // useMemo: chỉ tính lại khi colorScheme thay đổi (CLO2)
  const tamaguiTheme = useMemo(
    () => (colorScheme === 'dark' ? 'dark' : 'light'),
    [colorScheme],
  );

  // useCallback: hàm ổn định cho screenOptions (CLO2)
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const appointmentId = response.notification.request.content.data?.appointmentId;
      if (typeof appointmentId === 'string') {
        router.replace({ pathname: '/(tabs)/appointments', params: { appointmentId } });
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });
    return () => subscription.remove();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <TamaguiProvider config={config} defaultTheme={tamaguiTheme}>
            <Theme name={tamaguiTheme}>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <AppNavigator />
            </Theme>
          </TamaguiProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
