/**
 * src/app/item/create.tsx
 *
 * Route "/item/create" — màn hình tạo món đồ mới.
 * Màn hình tạm cho B (B15).
 */

import { router } from 'expo-router';
import { PlaceholderScreen } from '../../views/screens/PlaceholderScreen';
import { CustomButton } from '../../views/components/CustomButton';

export default function ItemCreateRoute() {
  return (
    <PlaceholderScreen
      title="Đăng đồ dùng mới"
      note="Màn hình tạm — B làm giao diện và logic (B15)"
    >
      <CustomButton onPress={() => router.back()}>
        Quay lại
      </CustomButton>
    </PlaceholderScreen>
  );
}
