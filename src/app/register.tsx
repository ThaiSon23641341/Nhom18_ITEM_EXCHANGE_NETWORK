/**
 * Route "/register": tạo tài khoản bằng email sinh viên và mật khẩu.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';
import { RegisterScreen } from '../views/screens/RegisterScreen';

export default function RegisterRoute() {
  const { email, notFound } = useLocalSearchParams<{ email?: string; notFound?: string }>();
  const { register, loginError, isSubmitting } = useAuthController();

  const handleRegister = async (
    emailValue: string,
    password: string,
    confirmPassword: string,
  ) => {
    if (await register(emailValue, password, confirmPassword)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <RegisterScreen
      initialEmail={email ?? ''}
      notice={notFound ? 'Email này chưa có tài khoản. Hãy tạo tài khoản mới để tiếp tục.' : null}
      onRegisterPress={(emailValue, password, confirmPassword) => {
        void handleRegister(emailValue, password, confirmPassword);
      }}
      onBackToLoginPress={() => router.replace('/login')}
      error={loginError}
      isSubmitting={isSubmitting}
    />
  );
}
