import { router, useLocalSearchParams } from 'expo-router';
import { CustomButton } from '../../../../views/components/CustomButton';
import { PlaceholderScreen } from '../../../../views/screens/PlaceholderScreen';

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
