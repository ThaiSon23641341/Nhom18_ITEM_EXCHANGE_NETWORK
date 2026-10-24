/**
 * src/app/login.tsx
 *
 * Route "/login" — màn hình đăng nhập tạm.
 * B làm giao diện (B08), A làm xử lý đăng nhập (B09).
 * File này chỉ import và re-export màn hình thật từ src/views/screens.
 */

import { useState } from 'react';
import { router } from 'expo-router';
import { LoginScreen } from '../views/screens/LoginScreen';
import { useAuthController } from '../controllers/useAuthController';
import { Alert } from 'react-native';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthController();

  const handleLogin = () => {
    setIsSubmitting(true);
    try {
      login(email);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Đăng nhập không thành công', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginScreen
      email={email}
      onEmailChange={setEmail}
      onLoginPress={handleLogin}
      isSubmitting={isSubmitting}
    />
  );
}
