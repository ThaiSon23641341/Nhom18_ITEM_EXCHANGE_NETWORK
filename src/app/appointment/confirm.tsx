import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import type { Item } from "../../models/itemModel";
import { getItemById } from "../../services/api/itemService";
import { getPublicUserById } from "../../services/authService";
import {
  combineAppointmentDate,
  isAppointmentDateInFuture,
  useAppointmentController,
} from "../../controllers/useAppointmentController";
import { useAuthController } from "../../controllers/useAuthController";
import { CustomButton } from "../../views/components/CustomButton";
import {
  APPOINTMENT_REMINDER_MINUTES,
  scheduleAppointmentReminder,
} from "../../services/device/notificationService";
import { goBackOrReplace } from "../../utils/navigation";

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
  const itemId = typeof params.itemId === "string" ? params.itemId : undefined;
  const date = typeof params.date === "string" ? params.date : "";
  const time = typeof params.time === "string" ? params.time : "";
  const timeLabel =
    typeof params.timeLabel === "string" ? params.timeLabel : time;
  const scheduledAt =
    typeof params.scheduledAt === "string" ? params.scheduledAt : "";
  const location = typeof params.location === "string" ? params.location : "";
  const note = typeof params.note === "string" ? params.note : "";
  const backToAppointmentForm = () =>
    goBackOrReplace(
      itemId
        ? { pathname: "/appointment/create", params: { itemId } }
        : "/(tabs)",
    );
  const [item, setItem] = useState<Item | null>(null);
  const [ownerFullName, setOwnerFullName] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { create } = useAppointmentController();
  const { user } = useAuthController();

  useEffect(() => {
    if (!itemId) return;
    let active = true;
    getItemById(itemId)
      .then((value) => {
        if (active) setItem(value);
      })
      .finally(() => {
        if (active) setLoadingItem(false);
      });
    return () => {
      active = false;
    };
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
  }, [item]);

  const appointmentDate = combineAppointmentDate(date, time);
  const isValid = Boolean(
    item &&
    itemId &&
    location &&
    appointmentDate &&
    isAppointmentDateInFuture(appointmentDate),
  );

  const submit = async () => {
    if (!isValid || !item || !itemId || !appointmentDate || submitting) {
      Alert.alert(
        "Thông tin chưa hợp lệ",
        "Vui lòng quay lại và kiểm tra ngày, giờ và địa điểm.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const appointment = await create({
        itemId,
        requesterId: user?.id ?? "user-001",
        date,
        time,
        scheduledAt: scheduledAt || appointmentDate.toISOString(),
        location,
        note: note || undefined,
      });
      let message = "Lịch hẹn đang chờ chủ món đồ xác nhận.";
      try {
        const reminder = await scheduleAppointmentReminder(
          appointment,
          item.title,
        );
        if (reminder.scheduled) {
          message += ` Đã đặt nhắc trước ${APPOINTMENT_REMINDER_MINUTES} phút.`;
        } else if (reminder.reason === "web") {
          message += " Trình duyệt không hỗ trợ lời nhắc native; hãy dùng ứng dụng trên điện thoại.";
        } else if (reminder.reason === "permission-denied") {
          message += " Bạn chưa cấp quyền thông báo nên chưa thể đặt lời nhắc.";
        } else if (reminder.reason === "too-soon") {
          message += ` Thời gian nhận còn dưới ${APPOINTMENT_REMINDER_MINUTES} phút nên không đặt lời nhắc.`;
        }
      } catch (error: unknown) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error("Không thể đặt nhắc lịch hẹn:", error);
        message += ` Không thể đặt lời nhắc (${detail}), nhưng lịch hẹn vẫn đã được tạo.`;
      }
      setSuccessMessage(message);
      if (Platform.OS === "web") {
        window.alert(`Đặt lịch thành công\n\n${message}`);
        router.replace("/(tabs)/appointments");
      } else {
        Alert.alert("Đặt lịch thành công", message, [
          {
            text: "Xem lịch hẹn",
            onPress: () => router.replace("/(tabs)/appointments"),
          },
        ]);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Vui lòng thử lại.";
      setSubmitError(message);
      if (Platform.OS === "web") {
        window.alert(`Không thể tạo lịch\n\n${message}`);
      } else {
        Alert.alert("Không thể tạo lịch", message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!itemId) {
    return (
      <YStack
        flex={1}
        backgroundColor="background"
        items="center"
        justify="center"
        p="6"
        gap="4"
      >
        <Text color="color" text="center">
          Thiếu thông tin món đồ được chọn.
        </Text>
        <CustomButton onPress={backToAppointmentForm}>
          Quay lại chỉnh sửa
        </CustomButton>
      </YStack>
    );
  }
  if (loadingItem)
    return (
      <YStack
        flex={1}
        backgroundColor="background"
        items="center"
        justify="center"
      >
        <ActivityIndicator />
      </YStack>
    );
  if (!item || !isValid) {
    return (
      <YStack
        flex={1}
        backgroundColor="background"
        items="center"
        justify="center"
        p="6"
        gap="4"
      >
        <Text color="color" text="center">
          Thông tin món đồ hoặc thời gian nhận không hợp lệ.
        </Text>
        <CustomButton onPress={backToAppointmentForm}>
          Quay lại chỉnh sửa
        </CustomButton>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 12 }}>
        <YStack flex={1} backgroundColor="background" p="5" gap="4">
          <Text color="color" fontSize="7" fontWeight="700">
            Xác nhận lịch hẹn
          </Text>
          {successMessage ? (
            <Text color="green" fontWeight="700">
              {successMessage}
            </Text>
          ) : null}
          {submitError ? (
            <Text color="red" fontWeight="700">
              {submitError}
            </Text>
          ) : null}
          <YStack
            gap="2"
            p="3"
            borderWidth={1}
            borderColor="border-color"
            rounded="4"
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 150, borderRadius: 8 }}
            />
            <Text color="color" fontSize="5" fontWeight="700">
              {item.title}
            </Text>
            <Text color="color" opacity={0.7}>
              Người đăng: {ownerFullName ?? item.ownerName ?? "Sinh viên IUH"}
            </Text>
          </YStack>
          <YStack gap="2">
            <Text color="color" fontWeight="700">
              Thời gian nhận
            </Text>
            <Text color="color" fontSize="5">
              {date} - {timeLabel}
            </Text>
            <Text color="color" fontWeight="700">
              Địa điểm
            </Text>
            <Text color="color">{location}</Text>
            {note ? (
              <>
                <Text color="color" fontWeight="700">
                  Ghi chú
                </Text>
                <Text color="color">{note}</Text>
              </>
            ) : null}
          </YStack>
          <CustomButton disabled={submitting} onPress={backToAppointmentForm}>
            Quay lại chỉnh sửa
          </CustomButton>
          <CustomButton disabled={submitting} onPress={() => void submit()}>
            {submitting ? "Đang tạo lịch..." : "Xác nhận đặt lịch"}
          </CustomButton>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
