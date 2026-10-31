import { useState } from 'react';
import { ArrowLeft, CalendarClock, MapPin } from 'lucide-react-native';
import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';

export interface BookAppointmentScreenProps {
  item: Item;
  onBack: () => void;
  onSubmit: (date: string, time: string, location: string) => Promise<void>;
}

const getDefaultDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export function BookAppointmentScreen({ item, onBack, onSubmit }: BookAppointmentScreenProps) {
  const [date, setDate] = useState(getDefaultDate);
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState(item.location ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(date.trim(), time.trim(), location.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể tạo lịch hẹn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack h={56} px="4" items="center" gap="3" borderBottomWidth={1} borderColor="border-color">
        <Button w={40} h={40} circular backgroundColor="#E8F5EF" borderWidth={0} aria-label="Quay lại" onPress={onBack}>
          <ArrowLeft size={20} color="#145B45" />
        </Button>
        <Text color="secondary" fontSize="5" fontWeight="800">Đặt lịch nhận đồ</Text>
      </XStack>
      <ScrollView flex={1} keyboardShouldPersistTaps="handled">
        <YStack p="4" gap="4">
          <YStack p="4" gap="2" rounded="5" backgroundColor="#E8F5EF">
            <Text color="secondary" fontSize="4" fontWeight="700">{item.title}</Text>
            <Text color="primary">{item.ownerName ?? 'Sinh viên IUH'}</Text>
            <Text color="color" opacity={0.75}>{item.location ?? 'Trong khuôn viên IUH'}</Text>
          </YStack>

          <YStack gap="2">
            <XStack items="center" gap="2">
              <CalendarClock size={18} color="#16815D" />
              <Text color="color" fontWeight="700">Ngày nhận (YYYY-MM-DD)</Text>
            </XStack>
            <Input
              value={date}
              onChangeText={setDate}
              placeholder="2026-12-31"
              aria-label="Ngày nhận"
              autoCapitalize="none"
            />
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Giờ nhận (HH:MM)</Text>
            <Input
              value={time}
              onChangeText={setTime}
              placeholder="14:00"
              aria-label="Giờ nhận"
              autoCapitalize="none"
            />
          </YStack>

          <YStack gap="2">
            <XStack items="center" gap="2">
              <MapPin size={18} color="#16815D" />
              <Text color="color" fontWeight="700">Địa điểm gặp</Text>
            </XStack>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder="Ví dụ: Thư viện IUH"
              aria-label="Địa điểm gặp"
            />
          </YStack>

          {error ? <Text color="red" role="alert">{error}</Text> : null}
          <Button
            h={50}
            backgroundColor="primary"
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : undefined}
            onPress={submit}
          >
            <Button.Text color="white" fontWeight="700">
              {isSubmitting ? 'Đang gửi yêu cầu...' : 'Xác nhận lịch'}
            </Button.Text>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
