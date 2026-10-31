/**
 * src/app/login.tsx
 *
 * Route "/login" — màn hình đăng nhập tạm.
 * B làm giao diện (B08), A làm xử lý đăng nhập (B09).
 * File này chỉ import và re-export màn hình thật từ src/views/screens.
 */

import { router } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';
import { LoginScreen } from '../views/screens/LoginScreen';

export default function LoginRoute() {
  const { login, loginError } = useAuthController();

  const handleLogin = (email: string) => {
    if (login(email)) {
      router.replace('/(tabs)');
    }
  };

  return <LoginScreen onLoginPress={handleLogin} error={loginError} />;
}
