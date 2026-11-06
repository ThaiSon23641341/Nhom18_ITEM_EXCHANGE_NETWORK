import { useAppointmentController } from '../../controllers/useAppointmentController';
import { Alert, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Image, Button, XStack, YStack, Text, Separator, ScrollView } from 'tamagui';
import { getItemById } from '../../services/api/itemService';
import type { Item } from '../../models/itemModel';
import { getPublicUserById } from '../../services/authService';
import { router, type Href } from 'expo-router';
import { useAuthController } from '../../controllers/useAuthController';
import type { AppointmentStatus } from '../../models/appointmentModel';

const appointmentStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đang xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn tất',
} as const;

const appointmentStatusOrder: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

export function AppointmentsScreen() {
  const { appointments, cancel, updateStatus } = useAppointmentController();
  const { user } = useAuthController();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [requesterNames, setRequesterNames] = useState<Record<string, string>>({});
  const groupedAppointments = appointmentStatusOrder
    .map((status) => ({
      status,
      appointments: appointments.filter((appointment) => appointment.status === status),
    }))
    .filter((group) => group.appointments.length > 0);

  useEffect(() => {
    let active = true;
    const itemIds = [...new Set(appointments.map((appointment) => appointment.itemId))];
    void Promise.all(
      itemIds.map(async (itemId) => {
        try {
          const item = await getItemById(itemId);
          return item;
        } catch {
          return null;
        }
      }),
    ).then((loadedItems) => {
      if (!active) return;
      setItems(
        Object.fromEntries(
          loadedItems
            .filter((item): item is Item => item !== null)
            .map((item) => [item.id, item]),
        ),
      );
      const ownerIds = [...new Set(
        loadedItems
          .filter((item): item is Item => item !== null)
          .map((item) => item.ownerId),
      )];
      const requesterIds = [...new Set(
        appointments.map((appointment) => appointment.requesterId),
      )];
      void Promise.all(
        ownerIds.map(async (ownerId) => {
          try {
            const user = await getPublicUserById(ownerId);
            return [ownerId, user.fullName] as const;
          } catch {
            return [ownerId, 'Không rõ'] as const;
          }
        }),
      ).then((names) => {
        if (active) setUserNames(Object.fromEntries(names));
      });
      void Promise.all(
        requesterIds.map(async (requesterId) => {
          try {
            const requester = await getPublicUserById(requesterId);
            return [requesterId, requester.fullName] as const;
          } catch {
            return [requesterId, 'Không rõ'] as const;
          }
        }),
      ).then((names) => {
        if (active) setRequesterNames(Object.fromEntries(names));
      });
    });
    return () => {
      active = false;
    };
  }, [appointments]);

  const performCancel = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      await cancel(appointmentId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Vui lòng thử lại.';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Không thể hủy lịch: ${message}`);
      } else {
        Alert.alert('Không thể hủy lịch', message);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancel = (appointmentId: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Bạn có chắc muốn hủy lịch hẹn này không?')) {
        void performCancel(appointmentId);
      }
      return;
    }
    Alert.alert('Hủy lịch hẹn', 'Bạn có chắc muốn hủy lịch hẹn này không?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch',
        style: 'destructive',
        onPress: () => void performCancel(appointmentId),
      },
    ]);
  };

  const handleOwnerStatus = (
    appointmentId: string,
    status: 'confirmed' | 'cancelled' | 'completed',
    message: string,
  ) => {
    const update = () => {
      setCancellingId(appointmentId);
      void updateStatus(appointmentId, status)
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Vui lòng thử lại.';
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.alert(`Không thể cập nhật lịch: ${errorMessage}`);
          } else {
            Alert.alert('Không thể cập nhật lịch', errorMessage);
          }
        })
        .finally(() => setCancellingId(null));
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(message)) update();
      return;
    }
    Alert.alert('Cập nhật lịch hẹn', message, [
      { text: 'Không', style: 'cancel' },
      { text: 'Xác nhận', onPress: update },
    ]);
  };

  return (
    <YStack flex={1} backgroundColor="background" p="5" gap="3">
      <Text fontSize="7" fontWeight="700" color="color">Lịch hẹn nhận đồ</Text>
      <ScrollView flex={1} showsVerticalScrollIndicator>
        <YStack gap="3">
          {appointments.length === 0 ? (
            <Text color="color" opacity={0.7}>Bạn chưa có lịch hẹn nào.</Text>
          ) : (
            groupedAppointments.map((group) => (
              <YStack key={group.status} gap="2">
                <XStack items="center" justify="space-between" pt="2">
                  <Text color="color" fontSize="5" fontWeight="700">
                    {appointmentStatusLabels[group.status]}
                  </Text>
                  <Text color="color" opacity={0.65}>
                    {group.appointments.length}
                  </Text>
                </XStack>
                {group.appointments.map((appointment) => {
                  const item = items[appointment.itemId];
                  const isOwner = item?.ownerId === user?.id;
                  const hasBothConfirmed = Boolean(
                    item
                    && appointment.confirmedBy?.includes(item.ownerId)
                    && appointment.confirmedBy?.includes(appointment.requesterId),
                  );
                  return (
                    <YStack
                      key={appointment.id}
                      gap="2"
                      p="4"
                      borderWidth={1}
                      borderColor="border-color"
                      rounded="4"
                    >
                      <XStack gap="3" items="center">
                        {item?.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            width={72}
                            height={72}
                            style={{ borderRadius: 12 }}
                          />
                        ) : null}
                        <YStack flex={1} gap="1">
                          <Text color="color" fontWeight="700">
                            {item?.title ?? 'Đang tải tên món đồ...'}
                          </Text>
                          <Text color="color" opacity={0.7}>
                            {isOwner ? 'Người đặt: ' : 'Người đăng: '}
                            {isOwner
                              ? requesterNames[appointment.requesterId] ?? 'Đang tải...'
                              : userNames[item?.ownerId ?? ''] ?? item?.ownerName ?? 'Không rõ'}
                          </Text>
                        </YStack>
                      </XStack>
                      <Text color="color">Ngày: {appointment.date} - {appointment.time}</Text>
                      <Text color="color">Địa điểm: {appointment.location}</Text>
                      {appointment.note ? <Text color="color">Ghi chú: {appointment.note}</Text> : null}
                      <Text color="color">
                        Trạng thái: {appointment.status === 'confirmed' && !hasBothConfirmed
                          ? 'Chờ người còn lại xác nhận'
                          : appointmentStatusLabels[appointment.status]}
                      </Text>
                      <Button
                        onPress={() => router.push({
                          pathname: '/item/[id]',
                          params: { id: appointment.itemId, from: 'appointments' },
                        })}
                      >
                        Xem chi tiết món
                      </Button>
                      {appointment.status === 'pending' || appointment.status === 'confirmed'
                        ? !appointment.confirmedBy?.includes(user?.id ?? '') ? (
                          <Button
                            disabled={cancellingId === appointment.id}
                            onPress={() => handleOwnerStatus(
                              appointment.id,
                              'confirmed',
                              'Bạn xác nhận sẽ tham gia lịch hẹn này?',
                            )}
                          >
                            Xác nhận lịch hẹn
                          </Button>
                        ) : null
                        : null}
                      {isOwner && appointment.status === 'pending' ? (
                        <Button
                          theme="red"
                          disabled={cancellingId === appointment.id}
                          onPress={() => handleOwnerStatus(
                            appointment.id,
                            'cancelled',
                            'Từ chối lịch hẹn này?',
                          )}
                        >
                          Từ chối lịch hẹn
                        </Button>
                      ) : null}
                      {isOwner && appointment.status === 'confirmed' && hasBothConfirmed ? (
                        <Button
                          disabled={cancellingId === appointment.id}
                          onPress={() => handleOwnerStatus(
                            appointment.id,
                            'completed',
                            'Xác nhận đã trao món đồ?',
                          )}
                        >
                          Đã trao đồ
                        </Button>
                      ) : null}
                      {hasBothConfirmed ? (
                        <Button
                          onPress={() => router.push(
                            `/appointment/${encodeURIComponent(appointment.id)}/chat` as Href,
                          )}
                        >
                          Mở chat
                        </Button>
                      ) : null}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') ? (
                        <Button
                          theme="red"
                          disabled={cancellingId === appointment.id}
                          onPress={() => isOwner
                            ? handleOwnerStatus(
                              appointment.id,
                              'cancelled',
                              'Bạn có chắc muốn hủy lịch hẹn này không?',
                            )
                            : handleCancel(appointment.id)}
                        >
                          {cancellingId === appointment.id
                            ? 'Đang hủy...'
                            : 'Hủy lịch hẹn'}
                        </Button>
                      ) : null}
                      <Separator />
                    </YStack>
                  );
                })}
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export default AppointmentsScreen;
