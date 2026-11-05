import { useState } from 'react';
import { ArrowLeft, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { CustomButton } from '../components/CustomButton';
import { AuthTextField } from '../components/AuthTextField';

export interface ForgotPasswordScreenProps {
  initialEmail?: string;
  onRequestCode?: (email: string) => Promise<string | null>;
  onResetPassword?: (
    email: string,
    resetCode: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  onBackToLoginPress?: () => void;
  onResetDone?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function ForgotPasswordScreen({
  initialEmail = '',
  onRequestCode,
  onResetPassword,
  onBackToLoginPress,
  onResetDone,
  isSubmitting = false,
  error,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requestCode = async () => {
    const code = await onRequestCode?.(email.trim());
    if (code) {
      setDemoCode(code);
      setResetCode('');
    }
  };

  const resetPassword = async () => {
    const done = await onResetPassword?.(email.trim(), resetCode, newPassword, confirmPassword);
    if (done) onResetDone?.();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5FBF7' }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack flex={1} backgroundColor="#F5FBF7" p="5" items="center">
        <YStack w="100%" maxW={440} gap="4">
          <Pressable
            onPress={onBackToLoginPress}
            accessibilityRole="button"
            accessibilityLabel="Quay lại đăng nhập"
            hitSlop={8}
          >
            <XStack items="center" gap="2">
              <ArrowLeft size={20} color="#17634B" />
              <Text color="#17634B" fontSize="3" fontWeight="700">
                Đăng nhập
              </Text>
            </XStack>
          </Pressable>

          <YStack gap="1">
            <Text color="#153D30" fontSize="7" fontWeight="800">
              Quên mật khẩu
            </Text>
            <Text color="#718078" fontSize="4">
              {demoCode
                ? 'Nhập mã xác nhận và đặt mật khẩu mới'
                : 'Nhập email sinh viên để nhận mã xác nhận'}
            </Text>
          </YStack>

          <YStack gap="3">
            <AuthTextField
              label="Email sinh viên"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              placeholder="23636991.phuc@student.iuh.edu.vn"
              keyboardType="email-address"
              disabled={isSubmitting || demoCode !== null}
            />

            {demoCode ? (
              <>
                <YStack gap="1" backgroundColor="#E5F2E9" p="3" rounded="4">
                  <XStack items="center" gap="2">
                    <ShieldCheck size={18} color="#17634B" />
                    <Text color="#17634B" fontSize="3" fontWeight="700">
                      Mã xác nhận của bạn: {demoCode}
                    </Text>
                  </XStack>
                  <Text color="#718078" fontSize="2">
                    Bản demo không gửi email nên mã hiển thị ngay tại đây và hết hạn sau 10 phút.
                  </Text>
                </YStack>
                <AuthTextField
                  label="Mã xác nhận"
                  icon={KeyRound}
                  value={resetCode}
                  onChangeText={setResetCode}
                  placeholder="6 chữ số"
                  keyboardType="number-pad"
                  disabled={isSubmitting}
                />
                <AuthTextField
                  label="Mật khẩu mới"
                  icon={Lock}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Tạo mật khẩu mới"
                  secure
                  disabled={isSubmitting}
                  hint="8–64 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
                />
                <AuthTextField
                  label="Nhập lại mật khẩu mới"
                  icon={Lock}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  secure
                  disabled={isSubmitting}
                  onSubmitEditing={() => { void resetPassword(); }}
                />
              </>
            ) : null}

            {error ? (
              <Text color="#B42318" fontSize="2" role="alert">
                {error}
              </Text>
            ) : null}

            <CustomButton
              onPress={() => { void (demoCode ? resetPassword() : requestCode()); }}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.7 : undefined}
              h={56}
              rounded="4"
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? 'Đang xử lý…'
                : demoCode
                  ? 'Đặt lại mật khẩu'
                  : 'Gửi mã xác nhận'}
            </CustomButton>

            {demoCode ? (
              <Pressable
                onPress={() => { void requestCode(); }}
                accessibilityRole="button"
                disabled={isSubmitting}
              >
                <Text color="#17634B" fontSize="3" fontWeight="700" text="center">
                  Gửi lại mã
                </Text>
              </Pressable>
            ) : null}
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

export default ForgotPasswordScreen;
