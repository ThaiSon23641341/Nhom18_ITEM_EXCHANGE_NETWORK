/**
 * src/app/item/[id]/edit.tsx
 *
 * Route "/item/[id]/edit" — màn hình chỉnh sửa món đồ.
 * Màn hình tạm cho B (B17).
 */

import { router, useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../views/screens/PlaceholderScreen';
import { CustomButton } from '../../../views/components/CustomButton';

export default function ItemEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Chỉnh sửa Món đồ"
      note={`ID: ${id ?? ''} · Màn hình tạm — B làm giao diện và logic (B17)`}
    >
      <CustomButton onPress={() => router.back()}>
        Quay lại
      </CustomButton>
    </PlaceholderScreen>
  );
}
