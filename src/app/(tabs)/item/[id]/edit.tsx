import { useLocalSearchParams } from 'expo-router';
import { goBackOrReplace } from '../../../../utils/navigation';
import { CustomButton } from '../../../../views/components/CustomButton';
import { PlaceholderScreen } from '../../../../views/screens/PlaceholderScreen';

export default function ItemEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Chỉnh sửa Món đồ"
      note={`ID: ${id ?? ''} · Màn hình tạm — B làm giao diện và logic (B17)`}
    >
      <CustomButton onPress={() => goBackOrReplace(
        id
          ? { pathname: '/item/[id]', params: { id } }
          : '/(tabs)',
      )}>
        Quay lại
      </CustomButton>
    </PlaceholderScreen>
  );
}
