import { useState } from 'react';
import { CheckCircle2, Leaf, Mail } from 'lucide-react-native';
import {
  Image,
  Input,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import { CustomButton } from '../components/CustomButton';

export interface LoginScreenProps {
  email?: string;
  onEmailChange?: (email: string) => void;
  onLoginPress?: () => void;
  isSubmitting?: boolean;
}

export function LoginScreen({
  email,
  onEmailChange,
  onLoginPress,
  isSubmitting = false,
}: LoginScreenProps) {
  const [localEmail, setLocalEmail] = useState('');
  const displayedEmail = email ?? localEmail;
  const handleEmailChange = onEmailChange ?? setLocalEmail;
  const handleLoginPress = () => onLoginPress?.();

  return (
    <YStack
      flex={1}
      backgroundColor="#F5FBF7"
      p="5"
      justify="space-between"
      items="center"
    >
      <YStack w="100%" maxW={440} flex={1} justify="space-between">
        <YStack items="center" gap="2" pt="3">
          <YStack
            w={56}
            h={56}
            rounded="full"
            backgroundColor="primary"
            items="center"
            justify="center"
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

        <YStack w="100%" gap="4" py="4">
          <YStack w="100%" h={190} rounded="6" overflow="hidden" items="center" justify="center" backgroundColor="#E5F2E9">
            <Image
              src={require('../../../assets/AnhDangNhap.png')}
              width={440}
              height={190}
              objectFit="cover"
              alt="Minh họa khuôn viên trường học"
              accessible
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

          <YStack gap="2">
            <Text color="#17634B" fontSize="3" fontWeight="700">
              Email sinh viên
            </Text>
            <XStack
              items="center"
              gap="3"
              backgroundColor="#FFFFFF"
              borderColor="#DCE9E1"
              borderWidth={1}
              rounded="4"
              px="4"
              h={56}
            >
              <Mail size={20} color="#648273" />
              <Input
                flex={1}
                value={displayedEmail}
                onChangeText={handleEmailChange}
                placeholder="mssv.ten@student.iuh.edu.vn"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={handleLoginPress}
                borderWidth={0}
                backgroundColor="transparent"
                px={0}
                color="#153D30"
                fontSize="3"
              />
            </XStack>
            <CustomButton
              onPress={handleLoginPress}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.7 : undefined}
              h={56}
              rounded="4"
            >
              {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </CustomButton>
          </YStack>
        </YStack>

        <XStack
          items="center"
          justify="center"
          gap="2"
          pb="2"
        >
          <CheckCircle2 size={17} color="#16815D" />
          <Text color="#718078" fontSize="2">
            Cộng đồng trao đổi nội bộ IUH
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

export default LoginScreen;
