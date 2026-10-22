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

import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '../../tamagui.config';

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme={tamaguiTheme}>
        <Theme name={tamaguiTheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={screenOptions()} />
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
