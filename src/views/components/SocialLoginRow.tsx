import { Alert, Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const PROVIDERS = [
  { id: 'google', label: 'Google', glyph: 'G', color: '#DB4437' },
  { id: 'facebook', label: 'Facebook', glyph: 'f', color: '#1877F2' },
] as const;

export function SocialLoginRow() {
  const handlePress = (label: string) => {
    Alert.alert(
      `Liên kết ${label}`,
      'Tính năng liên kết tài khoản chưa được kết nối ở bản demo. Vui lòng dùng email sinh viên IUH.',
    );
  };

  return (
    <YStack gap="3">
      <XStack items="center" gap="3">
        <YStack flex={1} h={1} backgroundColor="#DCE9E1" />
        <Text color="#718078" fontSize="2">
          Hoặc tiếp tục với
        </Text>
        <YStack flex={1} h={1} backgroundColor="#DCE9E1" />
      </XStack>
      <XStack justify="center" gap="4">
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            onPress={() => handlePress(provider.label)}
            accessibilityRole="button"
            accessibilityLabel={`Tiếp tục với ${provider.label}`}
          >
            <YStack
              w={56}
              h={56}
              rounded="full"
              backgroundColor="#FFFFFF"
              borderColor="#DCE9E1"
              borderWidth={1}
              items="center"
              justify="center"
            >
              <Text color={provider.color} fontSize="7" fontWeight="800">
                {provider.glyph}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  );
}

export default SocialLoginRow;
