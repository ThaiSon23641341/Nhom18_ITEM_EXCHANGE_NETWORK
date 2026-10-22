/**
 * src/app/index.tsx
 *
 * Route "/" — điểm vào sau root layout.
 * Logic chuyển hướng nằm ở Controller (useAuthController).
 * File này chỉ đọc kết quả rồi dùng <Redirect> của Expo Router.
 *
 * CLO2: useAuthController dùng useMemo bên trong.
 */

import { Redirect } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';

export default function IndexRoute() {
  const { isAuthenticated } = useAuthController();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
