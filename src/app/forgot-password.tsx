/**
 * Route "/forgot-password": lấy mã xác nhận và đặt lại mật khẩu.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';
import { ForgotPasswordScreen } from '../views/screens/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { requestReset, completeReset, loginError, isSubmitting } = useAuthController();

  return (
    <ForgotPasswordScreen
      initialEmail={email ?? ''}
      onRequestCode={requestReset}
      onResetPassword={completeReset}
      onBackToLoginPress={() => router.replace('/login')}
      onResetDone={() => router.replace('/login')}
      error={loginError}
      isSubmitting={isSubmitting}
    />
  );
}
