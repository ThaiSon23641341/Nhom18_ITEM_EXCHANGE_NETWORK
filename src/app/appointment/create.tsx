import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Text, TextArea, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { getItemById } from '../../services/api/itemService';
import { getPublicUserById } from '../../services/authService';
import { combineAppointmentDate, isAppointmentDateInFuture } from '../../controllers/useAppointmentController';
import { CustomButton } from '../../views/components/CustomButton';
import { goBackOrReplace } from '../../utils/navigation';

const pad = (value: number) => value.toString().padStart(2, '0');
const formatDate = (value: Date) => `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
const formatTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const SUGGESTED_TIMES = ['09:00 - 09:30', '10:00 - 10:30', '14:00 - 14:30', '16:00 - 16:30'];

function DatePicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const [month, setMonth] = useState(
    () => new Date(selected?.getFullYear() ?? today.getFullYear(), selected?.getMonth() ?? today.getMonth(), 1),
  );
  const [yearInput, setYearInput] = useState(String(month.getFullYear()));
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
          <YStack backgroundColor="background" p="5" gap="3">
            <Text color="color" fontSize="6" fontWeight="700">Chọn ngày nhận</Text>
            {showMonthYearPicker ? (
              <YStack gap="3">
                <Text color="color" opacity={0.7}>Nhập năm rồi chọn tháng</Text>
                <Input
                  value={yearInput}
                  onChangeText={(value) => setYearInput(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Năm"
                  keyboardType="number-pad"
                  maxLength={4}
                  aria-label="Năm"
                />
                <View style={styles.monthPickerGrid}>
                  {MONTHS.map((label, index) => {
                    const year = Number(yearInput);
                    const validYear = yearInput.length === 4 && year >= today.getFullYear();
                    const disabled = !validYear
                      || (year === today.getFullYear() && index < today.getMonth());
                    const isSelected = year === month.getFullYear() && index === month.getMonth();
                    return (
                      <View key={label} style={styles.monthPickerCell}>
                        <Pressable
                          disabled={disabled}
                          onPress={() => {
                            setMonth(new Date(year, index, 1));
                            setShowMonthYearPicker(false);
                          }}
                          style={[styles.monthButton, isSelected && styles.selectedDay, disabled && styles.disabled]}
                        >
                          <Text color={isSelected ? 'white' : 'color'} fontWeight={isSelected ? '700' : '400'}>
                            {label}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </YStack>
            ) : (
              <>
                <View style={styles.monthHeader}>
                  <Pressable
                    disabled={isCurrentMonth}
                    onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                    style={[styles.arrowButton, isCurrentMonth && styles.disabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Tháng trước"
                  >
                    <Text color="color" fontSize="6">‹</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setYearInput(String(month.getFullYear()));
                      setShowMonthYearPicker(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Chọn tháng và năm"
                  >
                    <Text color="color" fontWeight="700">{pad(month.getMonth() + 1)}/{month.getFullYear()} ▾</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                    style={styles.arrowButton}
                    accessibilityRole="button"
                    accessibilityLabel="Tháng tiếp theo"
                  >
                    <Text color="color" fontSize="6">›</Text>
                  </Pressable>
                </View>
                <View style={styles.calendarGrid}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                    <View key={day} style={styles.calendarCell}><Text color="color" opacity={0.6} text="center">{day}</Text></View>
                  ))}
                  {cells.map((day, index) => {
                    if (!day) return <View key={`empty-${index}`} style={styles.calendarCell} />;
                    const candidate = new Date(month.getFullYear(), month.getMonth(), day);
                    const disabled = candidate < today;
                    const selectedDay = selected?.toDateString() === candidate.toDateString();
                    return (
                      <View key={day} style={styles.calendarCell}>
                        <Pressable
                          disabled={disabled}
                          onPress={() => { onSelect(candidate); onClose(); }}
                          style={[styles.dayButton, selectedDay && styles.selectedDay, disabled && styles.disabled]}
                        >
                          <Text color={selectedDay ? 'white' : 'color'} fontWeight={selectedDay ? '700' : '400'}>{day}</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: { width: '100%' },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  arrowButton: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthPickerGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthPickerCell: { alignItems: 'center', justifyContent: 'center', minHeight: 52, width: '33.333%' },
  monthButton: { alignItems: 'center', borderRadius: 8, justifyContent: 'center', minHeight: 40, paddingHorizontal: 8, width: '90%' },
  calendarCell: { alignItems: 'center', justifyContent: 'center', minHeight: 44, width: `${100 / 7}%` },
  dayButton: { alignItems: 'center', borderRadius: 22, height: 40, justifyContent: 'center', width: 40 },
  selectedDay: { backgroundColor: '#2563EB' },
  disabled: { opacity: 0.3 },
});

export default function AppointmentCreateRoute() {
  const { itemId: rawItemId } = useLocalSearchParams<{ itemId?: string }>();
  const itemId = typeof rawItemId === 'string' ? rawItemId : undefined;
  const backToItem = () => goBackOrReplace(
    itemId ? { pathname: '/item/[id]', params: { id: itemId } } : '/(tabs)',
  );
  const [item, setItem] = useState<Item | null>(null);
  const [ownerFullName, setOwnerFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    let active = true;
    getItemById(itemId).then((value) => { if (active) setItem(value); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [itemId]);

  useEffect(() => {
    if (!item?.ownerId) return;
    let active = true;
    void getPublicUserById(item.ownerId)
      .then((owner) => {
        if (active) setOwnerFullName(owner.fullName);
      })
      .catch(() => {
        if (active) setOwnerFullName(item.ownerName ?? null);
      });
    return () => {
      active = false;
    };
  }, [item?.ownerId, item?.ownerName]);

  if (!itemId) {
    return <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text color="color">Không tìm thấy món đồ đã chọn.</Text><CustomButton onPress={backToItem}>Quay lại</CustomButton>
    </YStack>;
  }
  if (!item && !loading) {
    return <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
      <Text color="color">Không thể tải món đồ đã chọn.</Text><CustomButton onPress={backToItem}>Quay lại</CustomButton>
    </YStack>;
  }
  if (loading || !item) return <YStack flex={1} backgroundColor="background" items="center" justify="center"><ActivityIndicator /></YStack>;

  const continueToConfirmation = () => {
    const appointmentDate = combineAppointmentDate(date, time);
    if (!appointmentDate) {
      Alert.alert('Thời gian chưa hợp lệ', 'Vui lòng nhập ngày và giờ đúng định dạng.');
      return;
    }
    if (!isAppointmentDateInFuture(appointmentDate)) {
      Alert.alert(
        'Không thể đặt lịch',
        'Ngày và giờ nhận đồ không được ở trong quá khứ. Vui lòng chọn thời gian khác.',
      );
      return;
    }
    router.push({
      pathname: '/appointment/confirm',
      params: {
        itemId: item.id,
        date,
        time,
        timeLabel: time,
        scheduledAt: appointmentDate.toISOString(),
        location: location.trim(),
        note: note.trim(),
      },
    });
  };
  const appointmentDateForForm = combineAppointmentDate(date, time);
  const isPastAppointment = Boolean(
    appointmentDateForForm && !isAppointmentDateInFuture(appointmentDateForForm),
  );
  const canContinue = Boolean(date && time && location.trim());

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 12 }}>
          <YStack flex={1} backgroundColor="background" p="4" gap="3">
          <Text color="color" fontSize="7" fontWeight="700" text="center">Đặt lịch nhận đồ</Text>
          <Text color="color" opacity={0.65} fontSize="3" text="center">Chọn thời gian và địa điểm nhận đồ</Text>
          <XStack gap="3" p="3" borderWidth={1} borderColor="border-color" rounded="6" items="center">
            <Image source={{ uri: item.imageUrl }} style={{ width: 86, height: 86, borderRadius: 10 }} />
            <YStack flex={1} gap="1">
              <Text color="color" fontSize="5" fontWeight="700" numberOfLines={2}>{item.title}</Text>
              <Text color="color" opacity={0.7} fontSize="3">Món đồ trao đổi</Text>
              <Text color="primary" fontWeight="700" fontSize="3">
                Người đăng: {ownerFullName ?? item.ownerName ?? 'Sinh viên IUH'}
              </Text>
            </YStack>
          </XStack>
          <YStack gap="2">
            <Text color="primary" fontWeight="700" fontSize="4">Ngày và giờ nhận</Text>
            <XStack gap="2">
              <YStack flex={1}>
                <CustomButton onPress={() => setDatePickerVisible(true)}>
                  {date || 'Chọn ngày'}
                </CustomButton>
              </YStack>
              <YStack flex={1}>
                <Input
                  h={40}
                  value={time}
                  onChangeText={(value) => setTime(formatTimeInput(value))}
                  placeholder="HH:MM"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </YStack>
            </XStack>
            <Text color="color" opacity={0.65} fontSize="2">Hoặc chọn nhanh một khung giờ</Text>
            <XStack gap="2" flexWrap="wrap">
              {SUGGESTED_TIMES.map((option) => {
                const startTime = option.slice(0, 5);
                const selected = time === startTime;
                return (
                  <CustomButton
                    key={option}
                    onPress={() => setTime(startTime)}
                    opacity={selected ? 1 : 0.8}
                  >
                    {option}
                  </CustomButton>
                );
              })}
            </XStack>
          </YStack>
          {date && time ? (
            <Text color="color" fontSize="4" fontWeight="700" backgroundColor="background-hover" p="2" rounded="3">
                {date} - {time}
            </Text>
          ) : (
            <Text color="color" opacity={0.75} fontSize="3">Vui lòng chọn ngày và giờ nhận.</Text>
          )}
          {isPastAppointment ? (
            <Text color="red" fontSize="3" fontWeight="700">
              Ngày và giờ nhận đồ đã qua. Vui lòng chọn thời gian khác.
            </Text>
          ) : null}
          <Text color="primary" fontWeight="700" fontSize="5">Địa điểm nhận đồ</Text>
          <Input
            h={40}
            value={location}
            onChangeText={setLocation}
            placeholder="Nhập địa điểm nhận đồ"
            maxLength={200}
          />
          <TextArea value={note} onChangeText={setNote} placeholder="Ghi chú (không bắt buộc)" height={58} />
          <CustomButton disabled={!canContinue} onPress={continueToConfirmation}>Xác nhận lịch hẹn →</CustomButton>
          <CustomButton onPress={backToItem}>Quay lại</CustomButton>
          </YStack>
        </ScrollView>
        <DatePicker
          visible={datePickerVisible}
          selected={selectedDate}
          onSelect={(value) => {
            setSelectedDate(value);
            setDate(formatDate(value));
          }}
          onClose={() => setDatePickerVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
