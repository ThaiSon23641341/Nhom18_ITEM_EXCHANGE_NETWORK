import { useState } from 'react';
import { ArrowLeft, Lock, Mail, UserPlus } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { CustomButton } from '../components/CustomButton';
import { AuthTextField } from '../components/AuthTextField';
import { SocialLoginRow } from '../components/SocialLoginRow';

export interface RegisterScreenProps {
  initialEmail?: string;
  onRegisterPress?: (email: string, password: string, confirmPassword: string) => void;
  onBackToLoginPress?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  notice?: string | null;
}

export function RegisterScreen({
  initialEmail = '',
  onRegisterPress,
  onBackToLoginPress,
  isSubmitting = false,
  error,
  notice,
}: RegisterScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const submit = () => onRegisterPress?.(email.trim(), password, confirmPassword);

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
              Tạo tài khoản
            </Text>
            <Text color="#718078" fontSize="4">
              Dùng email sinh viên IUH để tham gia cộng đồng trao đổi
            </Text>
          </YStack>

          {notice ? (
            <Text color="#17634B" fontSize="3" backgroundColor="#E5F2E9" p="3" rounded="4">
              {notice}
            </Text>
          ) : null}

          <YStack gap="3">
            <AuthTextField
              label="Email sinh viên"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              placeholder="23636991.phuc@student.iuh.edu.vn"
              keyboardType="email-address"
              disabled={isSubmitting}
              hint="Định dạng: mã sinh viên 8 chữ số, dấu chấm, tên, rồi @student.iuh.edu.vn"
            />
            <AuthTextField
              label="Mật khẩu"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="Tạo mật khẩu"
              secure
              disabled={isSubmitting}
              hint="8–64 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
            />
            <AuthTextField
              label="Nhập lại mật khẩu"
              icon={Lock}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu"
              secure
              disabled={isSubmitting}
              onSubmitEditing={submit}
            />
            {error ? (
              <Text color="#B42318" fontSize="2" role="alert">
                {error}
              </Text>
            ) : null}
            <CustomButton
              onPress={submit}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.7 : undefined}
              h={56}
              rounded="4"
              icon={<UserPlus size={20} color="#FFFFFF" />}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
            </CustomButton>
          </YStack>

          <SocialLoginRow />

          <XStack justify="center" gap="2" pb="2">
            <Text color="#718078" fontSize="3">
              Đã có tài khoản?
            </Text>
            <Pressable onPress={onBackToLoginPress} accessibilityRole="link">
              <Text color="#17634B" fontSize="3" fontWeight="800">
                Đăng nhập
              </Text>
            </Pressable>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

export default RegisterScreen;
