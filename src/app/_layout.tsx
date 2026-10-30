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
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '../../tamagui.config';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // useMemo: chỉ tính lại khi colorScheme thay đổi (CLO2)
  const tamaguiTheme = useMemo(
    () => (colorScheme === 'dark' ? 'dark' : 'light'),
    [colorScheme],
  );

  // useCallback: hàm ổn định cho screenOptions (CLO2)
  const screenOptions = useCallback(
    () => ({
      headerShown: false,
    }),
    [],
  );

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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TamaguiProvider config={config} defaultTheme={tamaguiTheme}>
          <Theme name={tamaguiTheme}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={screenOptions()} />
          </Theme>
        </TamaguiProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
