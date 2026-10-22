/**
 * ItemDetailScreen.tsx  (PascalCase — CODING_STANDARDS.md)
 *
 * Màn hình chi tiết món đồ — nhận id qua useLocalSearchParams.
 * Hiện id ra màn hình để chứng minh truyền tham số đúng.
 * Có nút "Quay lại" (router.back) để kiểm thử điều hướng.
 * Giao diện thật sẽ do B làm (B22).
 *
 * Cú pháp token Tamagui v6/v3 shorthand: items, justify, text.
 * Chỉ dùng Tamagui, không ghi cứng màu hex (CLO5).
 */

import { router, useLocalSearchParams } from 'expo-router';
import { YStack, Text, Separator } from 'tamagui';
import { CustomButton } from '../components/CustomButton';

export function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text fontSize="8" fontWeight="700" color="color" text="center">
        Chi tiết Món đồ
      </Text>
      <Separator />
      <Text fontSize="5" color="color" text="center" opacity={0.7}>
        ID món đồ:
      </Text>
      <Text fontSize="6" fontWeight="700" color="color" text="center">
        {id ?? '(không có id)'}
      </Text>
      <Separator />
      <Text fontSize="3" color="color" text="center" opacity={0.6}>
        Giao diện thật sẽ do B làm (B22)
      </Text>
      <CustomButton onPress={() => router.back()}>
        Quay lại
      </CustomButton>
    </YStack>
  );
}

export default ItemDetailScreen;
