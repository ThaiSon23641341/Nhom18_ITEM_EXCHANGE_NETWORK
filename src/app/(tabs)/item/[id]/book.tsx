import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Text, YStack } from 'tamagui';
import { useAuthController } from '../../../../controllers/useAuthController';
import { useItemDetailController } from '../../../../controllers/useItemDetailController';
import { createAppointment } from '../../../../services/api/appointmentService';
import { BookAppointmentScreen } from '../../../../views/screens/BookAppointmentScreen';
import { goBackOrReplace } from '../../../../utils/navigation';

export default function BookAppointmentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuthController();
  const { item, isLoading, loadError, retry } = useItemDetailController(itemId);

  if (!user) return <Redirect href="/login" />;

  if (isLoading) {
    return (
      <YStack flex={1} items="center" justify="center">
        <Text>Đang tải thông tin đồ dùng...</Text>
      </YStack>
    );
  }

  if (loadError || !item) {
    return (
      <YStack flex={1} items="center" justify="center" gap="3" p="4">
        <Text color="red">{loadError ?? 'Không tìm thấy đồ dùng này.'}</Text>
        <Button onPress={retry}>Thử lại</Button>
        <Button onPress={() => goBackOrReplace('/(tabs)')}>Quay lại</Button>
      </YStack>
    );
  }

  return (
    <BookAppointmentScreen
      item={item}
      onBack={() => goBackOrReplace('/(tabs)')}
      onSubmit={async (date, time, location) => {
        await createAppointment({
          itemId: item.id,
          requesterId: user.id,
          date,
          time,
          location,
        });
        router.replace('/(tabs)/appointments');
      }}
    />
  );
}
