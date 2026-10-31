import { useAppointmentController } from '../../controllers/useAppointmentController';
import { YStack, Text, Separator } from 'tamagui';

export function AppointmentsScreen() {
  const { appointments } = useAppointmentController();

  return (
    <YStack flex={1} backgroundColor="background" p="5" gap="3">
      <Text fontSize="7" fontWeight="700" color="color">Lịch hẹn nhận đồ</Text>
      {appointments.length === 0 ? (
        <Text color="color" opacity={0.7}>Bạn chưa có lịch hẹn nào.</Text>
      ) : (
        appointments.map((appointment) => (
          <YStack key={appointment.id} gap="2" p="4" borderWidth={1} borderColor="border-color" rounded="4">
            <Text color="color" fontWeight="700">Món đồ: {appointment.itemId}</Text>
            <Text color="color">Ngày: {appointment.date} - {appointment.time}</Text>
            <Text color="color">Địa điểm: {appointment.location}</Text>
            {appointment.note ? <Text color="color">Ghi chú: {appointment.note}</Text> : null}
            <Text color="color">Trạng thái: {appointment.status === 'pending' ? 'Chờ xác nhận' : appointment.status}</Text>
            <Separator />
          </YStack>
        ))
      )}
    </YStack>
  );
}

export default AppointmentsScreen;
