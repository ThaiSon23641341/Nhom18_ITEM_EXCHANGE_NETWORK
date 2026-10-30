import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { getItemById } from '../../services/api/itemService';
import {
  combineAppointmentDate,
  isAppointmentDateInFuture,
  useAppointmentController,
} from '../../controllers/useAppointmentController';
import { useAuthController } from '../../controllers/useAuthController';
import { CustomButton } from '../../views/components/CustomButton';
import {
  APPOINTMENT_REMINDER_MINUTES,
  scheduleAppointmentReminder,
} from '../../services/device/notificationService';

export default function AppointmentConfirmRoute() {
  const params = useLocalSearchParams<{
    itemId?: string;
    date?: string;
    time?: string;
    timeLabel?: string;
    scheduledAt?: string;
    location?: string;
    note?: string;
  }>();
  const itemId = typeof params.itemId === 'string' ? params.itemId : undefined;
  const date = typeof params.date === 'string' ? params.date : '';
  const time = typeof params.time === 'string' ? params.time : '';
  const timeLabel = typeof params.timeLabel === 'string' ? params.timeLabel : time;
  const scheduledAt = typeof params.scheduledAt === 'string' ? params.scheduledAt : '';
  const location = typeof params.location === 'string' ? params.location : '';
  const note = typeof params.note === 'string' ? params.note : '';
  const [item, setItem] = useState<Item | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { create } = useAppointmentController();
  const { user } = useAuthController();

  useEffect(() => {
    if (!itemId) return;
    let active = true;
    getItemById(itemId).then((value) => { if (active) setItem(value); }).finally(() => { if (active) setLoadingItem(false); });
    return () => { active = false; };
  }, [itemId]);

  const appointmentDate = combineAppointmentDate(date, time);
  const isValid = Boolean(item && itemId && location && appointmentDate && isAppointmentDateInFuture(appointmentDate));

  const submit = async () => {
    if (!isValid || !item || !itemId || !appointmentDate || submitting) {
      Alert.alert('Thông tin chưa hợp lệ', 'Vui lòng quay lại và kiểm tra ngày, giờ và địa điểm.');
      return;
    }
    setSubmitting(true);
    try {
      const appointment = await create({
        itemId,
        requesterId: user?.id ?? 'user-001',
        date,
        time,
        scheduledAt: scheduledAt || appointmentDate.toISOString(),
        location,
        note: note || undefined,
      });
      let message = 'Lịch hẹn đang chờ chủ món đồ xác nhận.';
      try {
        const reminder = await scheduleAppointmentReminder(appointment, item.title);
        if (reminder.scheduled) {
          message += ` Đã đặt nhắc trước ${APPOINTMENT_REMINDER_MINUTES} phút.`;
        } else if (reminder.reason === 'permission-denied') {
          message += ' Bạn chưa cấp quyền thông báo nên chưa thể đặt lời nhắc.';
        } else if (reminder.reason === 'too-soon') {
          message += ' Thời gian nhận còn dưới 30 phút nên không đặt lời nhắc.';
        }
      } catch (error: unknown) {
        console.warn('Không thể đặt nhắc lịch hẹn:', error);
        message += ' Không thể đặt lời nhắc, nhưng lịch hẹn vẫn đã được tạo.';
      }
      Alert.alert('Đặt lịch thành công', message, [
        { text: 'Xem lịch hẹn', onPress: () => router.replace('/(tabs)/appointments') },
      ]);
    } catch (error: unknown) {
      Alert.alert('Không thể tạo lịch', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!itemId) {
    return <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text color="color" text="center">Thiếu thông tin món đồ được chọn.</Text>
      <CustomButton onPress={() => router.back()}>Quay lại chỉnh sửa</CustomButton>
    </YStack>;
  }
  if (loadingItem) return <YStack flex={1} backgroundColor="background" items="center" justify="center"><ActivityIndicator /></YStack>;
  if (!item || !isValid) {
    return <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text color="color" text="center">Thông tin món đồ hoặc thời gian nhận không hợp lệ.</Text>
      <CustomButton onPress={() => router.back()}>Quay lại chỉnh sửa</CustomButton>
    </YStack>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} backgroundColor="background" p="5" gap="4">
        <Text color="color" fontSize="7" fontWeight="700">Xác nhận lịch hẹn</Text>
        <YStack gap="2" p="3" borderWidth={1} borderColor="border-color" rounded="4">
          <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 150, borderRadius: 8 }} />
          <Text color="color" fontSize="5" fontWeight="700">{item.title}</Text>
          <Text color="color" opacity={0.7}>Người đăng: {item.ownerId}</Text>
        </YStack>
        <YStack gap="2">
          <Text color="color" fontWeight="700">Thời gian nhận</Text>
          <Text color="color" fontSize="5">{date} - {timeLabel}</Text>
          <Text color="color" fontWeight="700">Địa điểm</Text>
          <Text color="color">{location}</Text>
          {note ? <><Text color="color" fontWeight="700">Ghi chú</Text><Text color="color">{note}</Text></> : null}
        </YStack>
        <CustomButton disabled={submitting} onPress={() => router.back()}>Quay lại chỉnh sửa</CustomButton>
        <CustomButton disabled={submitting} onPress={() => void submit()}>
          {submitting ? 'Đang tạo lịch...' : 'Xác nhận đặt lịch'}
        </CustomButton>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
