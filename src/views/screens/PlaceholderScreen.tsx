/**
 * PlaceholderScreen.tsx  (PascalCase — CODING_STANDARDS.md)
 *
 * Màn hình tạm dùng chung. Nhận title và note (ghi ai sẽ làm).
 * Có thể nhận children để chèn các liên kết điều hướng kiểm thử.
 * Chỉ dùng thành phần Tamagui, không ghi cứng màu hex (CLO5).
 * Cú pháp Tamagui v6/v3 shorthands: items/justify thay cho alignItems/justifyContent,
 * text thay cho textAlign, số thuần cho kích thước/gap.
 */

import type { PropsWithChildren } from 'react';
import { YStack, Text, Separator } from 'tamagui';

interface PlaceholderScreenProps extends PropsWithChildren {
  title: string;
  note?: string;
}

export function PlaceholderScreen({ title, note, children }: PlaceholderScreenProps) {
  return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text fontSize="8" fontWeight="700" color="color" textAlign="center">
        {title}
      </Text>
      <Separator />
      {note ? (
        <Text fontSize="4" color="color" textAlign="center" opacity={0.7}>
          {note}
        </Text>
      ) : null}
      {children}
    </YStack>
  );
}

export default PlaceholderScreen;
