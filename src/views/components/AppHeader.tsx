import { Link } from 'expo-router';
import { BookOpen, UserRound } from 'lucide-react-native';
import { Image as NativeImage, Platform, Pressable } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { resolveMediaUrl } from '../../services/api/uploadService';

export function AppHeaderBrand() {
  return (
    <Link href="/(tabs)" asChild>
      <Pressable
        {...(Platform.OS === 'web'
          ? { 'aria-label': 'Trao Đổi IUH - về Khám phá' }
          : { accessibilityRole: 'link' as const, accessibilityLabel: 'Trao Đổi IUH - về Khám phá' })}
      >
        <XStack items="center" gap="2">
          <YStack
            w={40}
            h={40}
            rounded="4"
            backgroundColor="#E8F5EF"
            items="center"
            justify="center"
          >
            <BookOpen size={21} color="#16815D" />
          </YStack>
          <YStack>
            <Text color="primary" fontSize="4" fontWeight="800">
              Trao Đổi IUH
            </Text>
            <Text color="color" opacity={0.65} fontSize="1">
              Chia sẻ để sống xanh
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    </Link>
  );
}

export function AppHeaderProfileAction() {
  const { user } = useAuthController();
  const avatarUrl = user?.avatarUrl?.trim();

  return (
    <Link href="/(tabs)/profile" asChild>
      <Button
        w={40}
        h={40}
        circular
        p={0}
        overflow="hidden"
        backgroundColor="#E8F5EF"
        borderWidth={0}
        aria-label="Mở tài khoản"
      >
        {avatarUrl ? (
          <NativeImage
            source={{ uri: resolveMediaUrl(avatarUrl) }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            accessibilityLabel={`Ảnh đại diện ${user?.fullName ?? ''}`}
          />
        ) : <UserRound size={20} color="#16815D" />}
      </Button>
    </Link>
  );
}
