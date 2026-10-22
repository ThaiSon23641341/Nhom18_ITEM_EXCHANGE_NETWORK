/**
 * ExploreScreen.tsx  (PascalCase — CODING_STANDARDS.md)
 *
 * Màn hình Khám phá — danh sách món đồ trao đổi.
 * Tạm thời cung cấp các nút kiểm thử điều hướng:
 * - Xem chi tiết item-001 (B22)
 * - Đăng món đồ mới (B15)
 * - Chỉnh sửa item-001 (B17)
 * Giao diện chính thức sẽ do B làm (B15, B16, B22).
 */

import { Link } from 'expo-router';
import { YStack } from 'tamagui';
import { PlaceholderScreen } from './PlaceholderScreen';
import { CustomButton } from '../components/CustomButton';

export function ExploreScreen() {
  return (
    <PlaceholderScreen
      title="Khám phá"
      note="Danh sách đồ dùng sẽ hiển thị tại đây (B làm)"
    >
      <YStack gap="3" mt="4" items="center">
        <Link href="/item/item-001" asChild>
          <CustomButton>Xem chi tiết món đồ item-001</CustomButton>
        </Link>
        <Link href="/item/create" asChild>
          <CustomButton>Đăng món đồ mới</CustomButton>
        </Link>
        <Link href="/item/item-001/edit" asChild>
          <CustomButton>Chỉnh sửa món đồ item-001</CustomButton>
        </Link>
      </YStack>
    </PlaceholderScreen>
  );
}

export default ExploreScreen;
