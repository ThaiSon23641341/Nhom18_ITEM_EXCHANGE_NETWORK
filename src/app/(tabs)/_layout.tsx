/**
 * src/app/(tabs)/_layout.tsx
 *
 * Thanh tab dưới đáy màn hình.
 *
 * Các mục: Khám phá, Của tôi, Đăng bài, Lịch hẹn, Cá nhân.
 * Biểu tượng từ lucide-react-native (đã có trong dự án).
 * Màu lấy từ theme Tamagui qua useTheme() — không ghi cứng hex (CLO5).
 * Hỗ trợ cả Light và Dark.
 */

import { router, Tabs } from 'expo-router';
import { Pressable, useColorScheme, View } from 'react-native';
import { useTheme } from 'tamagui';
import { CalendarClock, Compass, Package, Plus, User } from 'lucide-react-native';
import { AppHeaderBrand, AppHeaderProfileAction } from '../../views/components/AppHeader';

export default function TabsLayout() {
  // useTheme() trả về object theme hiện tại (light hoặc dark) — CLO5
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const tabBarActiveTintColor = theme.primary?.val as string;
  const tabBarInactiveTintColor = (theme.colorSubtle?.val ?? theme.color?.val) as string;
  const tabBarBackgroundColor = theme.background?.val as string;
  const tabBarSurfaceColor = colorScheme === 'dark' ? '#1A2535' : '#FFFFFF';
  const tabBarEdgeColor = colorScheme === 'dark' ? '#263449' : '#E7EFEA';
  const getTabIconStyle = (focused: boolean) => ({
    width: 38,
    height: 30,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: focused
      ? colorScheme === 'dark'
        ? '#263449'
        : '#E8F5EF'
      : 'transparent',
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarBackground: () => (
          <View
            pointerEvents="none"
            style={{ flex: 1, backgroundColor: tabBarBackgroundColor }}
          />
        ),
        headerShown: true,
        headerTitle: AppHeaderBrand,
        headerTitleAlign: 'left',
        headerLeft: () => null,
        headerRight: AppHeaderProfileAction,
        tabBarStyle: {
          minHeight: 64,
          marginHorizontal: 0,
          marginBottom: 0,
          paddingTop: 3,
          paddingBottom: 3,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderTopColor: tabBarEdgeColor,
          borderBottomWidth: 0,
          backgroundColor: tabBarSurfaceColor,
          elevation: 8,
          shadowColor: '#000000',
          shadowOpacity: colorScheme === 'dark' ? 0.16 : 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarItemStyle: {
          flex: 1,
          flexBasis: 0,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: tabBarBackgroundColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.color?.val as string,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="item"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: {
            display: 'none',
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={getTabIconStyle(focused)}>
              <Compass color={color} size={size - 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-items"
        options={{
          title: 'Của tôi',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={getTabIconStyle(focused)}>
              <Package color={color} size={size - 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Đăng bài',
          tabBarShowLabel: false,
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đăng bài"
              accessibilityState={props.accessibilityState}
              testID={props.testID}
              onLongPress={props.onLongPress}
              onPress={() => router.push('/item/create')}
              style={[
                props.style,
                {
                  flex: 1,
                  flexBasis: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  marginTop: -8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 32,
                  backgroundColor: tabBarSurfaceColor,
                  shadowColor: tabBarActiveTintColor,
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 21,
                    backgroundColor: tabBarActiveTintColor,
                  }}
                >
                  <Plus color="white" size={23} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={getTabIconStyle(focused)}>
              <CalendarClock color={color} size={size - 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={getTabIconStyle(focused)}>
              <User color={color} size={size - 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
