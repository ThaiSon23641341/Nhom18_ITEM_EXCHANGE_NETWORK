/**
 * src/app/(tabs)/_layout.tsx
 *
 * Thanh tab dưới đáy màn hình.
 *
 * Tiêu đề tiếng Việt: Khám phá, Của tôi, Lịch hẹn, Tài khoản.
 * Biểu tượng từ lucide-react-native (đã có trong dự án).
 * Màu lấy từ theme Tamagui qua useTheme() — không ghi cứng hex (CLO5).
 * Hỗ trợ cả Light và Dark.
 */

import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { Compass, Package, CalendarClock, User } from 'lucide-react-native';

export default function TabsLayout() {
  // useTheme() trả về object theme hiện tại (light hoặc dark) — CLO5
  const theme = useTheme();

  const tabBarActiveTintColor = theme.primary?.val as string;
  const tabBarInactiveTintColor = (theme.colorSubtle?.val ?? theme.color?.val) as string;
  const tabBarBackgroundColor = theme.background?.val as string;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopColor: theme.borderColor?.val as string,
        },
        headerStyle: {
          backgroundColor: tabBarBackgroundColor,
        },
        headerTintColor: theme.color?.val as string,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-items"
        options={{
          title: 'Của tôi',
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ color, size }) => (
            <CalendarClock color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
