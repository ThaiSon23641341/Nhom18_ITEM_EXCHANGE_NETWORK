import { Link } from 'expo-router';
import { BookOpen, UserRound } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';

export function AppHeaderBrand() {
  return (
    <Link href="/(tabs)" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Trao Đổi IUH - về Khám phá">
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
  return (
    <Link href="/(tabs)/profile" asChild>
      <Button
        w={40}
        h={40}
        circular
        backgroundColor="#E8F5EF"
        borderWidth={0}
        aria-label="Mở tài khoản"
      >
        <UserRound size={20} color="#16815D" />
      </Button>
    </Link>
  );
}
