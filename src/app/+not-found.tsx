/**
 * src/app/+not-found.tsx
 *
 * Màn hình hiển thị khi người dùng truy cập đường dẫn không tồn tại.
 * Expo Router tự động hiển thị file này cho các route không khớp.
 * Cú pháp token Tamagui v6/v3 shorthand: items, justify, text.
 * Chỉ dùng Tamagui, không ghi cứng màu hex (CLO5).
 */

import { Link } from 'expo-router';
import { YStack, Text, Separator } from 'tamagui';

export default function NotFoundRoute() {
  return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text fontSize="9" fontWeight="700" color="color">
        404
      </Text>
      <Text fontSize="6" fontWeight="700" color="color" text="center">
        Trang không tồn tại
      </Text>
      <Separator />
      <Text fontSize="4" color="color" text="center" opacity={0.7}>
        Đường dẫn bạn truy cập không hợp lệ.
      </Text>
      <Link href="/(tabs)" asChild>
        <Text fontSize="4" color="primary" textDecorationLine="underline">
          Về trang chủ
        </Text>
      </Link>
    </YStack>
  );
}
