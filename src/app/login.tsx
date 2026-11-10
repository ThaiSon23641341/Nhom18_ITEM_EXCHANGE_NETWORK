/**
 * src/app/login.tsx
 *
 * Route "/login": đăng nhập bằng email sinh viên và mật khẩu.
 * Tài khoản chưa tồn tại sẽ được chuyển sang "/register".
 */

import { router } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';
import { LoginScreen } from '../views/screens/LoginScreen';

export default function LoginRoute() {
  const { login, loginError, isSubmitting } = useAuthController();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result === 'moderator-success') {
      router.replace('/admin');
    } else if (result === 'success') {
      router.replace('/(tabs)');
    } else if (result === 'account-not-found') {
      router.push({ pathname: '/register', params: { email, notFound: '1' } });
    }
  };

  return (
    <LoginScreen
      onLoginPress={(email, password) => { void handleLogin(email, password); }}
      onForgotPasswordPress={(email) => router.push({ pathname: '/forgot-password', params: { email } })}
      onRegisterPress={(email) => router.push({ pathname: '/register', params: { email } })}
      error={loginError}
      isSubmitting={isSubmitting}
    />
  );
}
