import { CalendarClock, MapPin } from 'lucide-react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { useAppointmentsController } from '../../controllers/useAppointmentsController';
import { useAuthController } from '../../controllers/useAuthController';

const STATUS_LABELS = {
  pending: 'Đang chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn tất',
} as const;

export function AppointmentsScreen() {
  const { user } = useAuthController();
  const { appointments, isLoading, loadError, retry } = useAppointmentsController(user?.id);

  return (
    <YStack flex={1} backgroundColor="background" p="4" gap="3">
      <Text color="secondary" fontSize="6" fontWeight="800">Lịch hẹn nhận đồ</Text>
      {isLoading ? (
        <Text color="color" opacity={0.65}>Đang tải lịch hẹn...</Text>
      ) : loadError ? (
        <YStack items="center" gap="3">
          <Text color="color" text="center">{loadError}</Text>
          {user ? <Button onPress={retry} theme="active">Thử lại</Button> : null}
        </YStack>
      ) : appointments.length === 0 ? (
        <Text color="color" opacity={0.65}>
          Bạn chưa có lịch hẹn nào. Mở chi tiết một đồ dùng còn hàng để đặt lịch nhận.
        </Text>
      ) : (
        <YStack gap="3">
          {appointments.map((appointment) => (
            <YStack
              key={appointment.id}
              p="4"
              gap="2"
              rounded="5"
              borderWidth={1}
              borderColor="border-color"
              backgroundColor="background"
            >
              <Text color="secondary" fontSize="4" fontWeight="700">
                Mã đồ dùng: {appointment.itemId}
              </Text>
              <XStack items="center" gap="2">
                <CalendarClock size={17} color="#16815D" />
                <Text color="color">{appointment.date} · {appointment.time}</Text>
              </XStack>
              <XStack items="center" gap="2">
                <MapPin size={17} color="#16815D" />
                <Text color="color">{appointment.location}</Text>
              </XStack>
              <Text color="primary" fontWeight="700">{STATUS_LABELS[appointment.status]}</Text>
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}
