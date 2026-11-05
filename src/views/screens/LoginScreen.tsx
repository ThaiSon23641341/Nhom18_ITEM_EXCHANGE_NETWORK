import { useState } from 'react';
import { CheckCircle2, Leaf, Lock, Mail } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import {
  Image,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import { CustomButton } from '../components/CustomButton';
import { AuthTextField } from '../components/AuthTextField';
import { SocialLoginRow } from '../components/SocialLoginRow';

export interface LoginScreenProps {
  email?: string;
  onEmailChange?: (email: string) => void;
  onLoginPress?: (email: string, password: string) => void;
  onForgotPasswordPress?: (email: string) => void;
  onRegisterPress?: (email: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function LoginScreen({
  email,
  onEmailChange,
  onLoginPress,
  onForgotPasswordPress,
  onRegisterPress,
  isSubmitting = false,
  error,
}: LoginScreenProps) {
  const [localEmail, setLocalEmail] = useState('');
  const [password, setPassword] = useState('');
  const displayedEmail = email ?? localEmail;
  const handleEmailChange = onEmailChange ?? setLocalEmail;
  const handleLoginPress = () => onLoginPress?.(displayedEmail.trim(), password);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5FBF7' }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack flex={1} backgroundColor="#F5FBF7" p="5" items="center">
        <YStack w="100%" maxW={440} flex={1} justify="space-between" gap="4">
          <YStack items="center" gap="2" pt="3">
            <YStack
              w={56}
              h={56}
              rounded="full"
              backgroundColor="primary"
              items="center"
              justify="center"
              aria-label="Biểu tượng lá xanh"
            >
              <Leaf size={29} color="#FFFFFF" strokeWidth={2.4} />
            </YStack>
            <Text color="primary" fontSize="8" fontWeight="800" text="center">
              Trao Đổi IUH
            </Text>
            <Text color="#718078" fontSize="3" text="center">
              Kết nối sinh viên • Chia sẻ giá trị
            </Text>
          </YStack>

          <YStack w="100%" gap="4" py="2">
            <YStack w="100%" h={150} rounded="6" overflow="hidden" items="center" justify="center" backgroundColor="#E5F2E9">
              <Image
                src={require('../../../assets/AnhDangNhap.png')}
                width={440}
                height={150}
                objectFit="cover"
                alt="Minh họa khuôn viên trường học"
                aria-label="Minh họa khuôn viên trường học"
              />
            </YStack>

            <YStack gap="1">
              <Text color="#153D30" fontSize="7" fontWeight="800">
                Chào mừng bạn trở lại
              </Text>
              <Text color="#718078" fontSize="4">
                Đăng nhập bằng email sinh viên
              </Text>
            </YStack>

            <YStack gap="3">
              <AuthTextField
                label="Email sinh viên"
                icon={Mail}
                value={displayedEmail}
                onChangeText={handleEmailChange}
                placeholder="23636991.phuc@student.iuh.edu.vn"
                keyboardType="email-address"
                disabled={isSubmitting}
              />
              <AuthTextField
                label="Mật khẩu"
                icon={Lock}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                secure
                disabled={isSubmitting}
                onSubmitEditing={handleLoginPress}
              />
              <XStack justify="flex-end">
                <Pressable
                  onPress={() => onForgotPasswordPress?.(displayedEmail.trim())}
                  accessibilityRole="link"
                >
                  <Text color="#17634B" fontSize="3" fontWeight="700">
                    Quên mật khẩu?
                  </Text>
                </Pressable>
              </XStack>
              {error ? (
                <Text color="#B42318" fontSize="2" role="alert">
                  {error}
                </Text>
              ) : null}
              <CustomButton
                onPress={handleLoginPress}
                disabled={isSubmitting}
                opacity={isSubmitting ? 0.7 : undefined}
                h={56}
                rounded="4"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </CustomButton>
            </YStack>

            <SocialLoginRow />

            <XStack justify="center" gap="2">
              <Text color="#718078" fontSize="3">
                Chưa có tài khoản?
              </Text>
              <Pressable
                onPress={() => onRegisterPress?.(displayedEmail.trim())}
                accessibilityRole="link"
              >
                <Text color="#17634B" fontSize="3" fontWeight="800">
                  Tạo tài khoản
                </Text>
              </Pressable>
            </XStack>
          </YStack>

          <XStack items="center" justify="center" gap="2" pb="2">
            <CheckCircle2 size={17} color="#16815D" />
            <Text color="#718078" fontSize="2">
              Cộng đồng trao đổi nội bộ IUH
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

export default LoginScreen;
