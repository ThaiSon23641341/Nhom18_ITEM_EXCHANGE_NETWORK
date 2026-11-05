import { useLocalSearchParams } from 'expo-router';
import { Button, ScrollView, Text, TextArea, YStack } from 'tamagui';
import { useItemReportController } from '../../controllers/useItemReportController';
import { REPORT_REASONS, type ReportReason } from '../../models/reportModel';
import { goBackOrReplace } from '../../utils/navigation';

const REASON_LABELS: Record<ReportReason, string> = {
  prohibited_item: 'Mặt hàng bị cấm',
  misleading_information: 'Thông tin sai lệch',
  inappropriate_content: 'Nội dung không phù hợp',
  suspected_scam: 'Nghi ngờ lừa đảo',
  other: 'Lý do khác',
};

export function ItemReportScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  const backToItem = () => goBackOrReplace(
    itemId ? { pathname: '/item/[id]', params: { id: itemId } } : '/(tabs)',
  );
  const {
    item,
    isLoading,
    loadError,
    reason,
    setReason,
    details,
    setDetails,
    isSubmitting,
    submitError,
    submitted,
    submitReport,
  } = useItemReportController(itemId);

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4">
        <Text color="color" accessibilityLabel="Đang tải bài đăng">
          Đang tải bài đăng...
        </Text>
      </YStack>
    );
  }

  if (loadError || !item) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="4">
        <Text color="color" accessibilityRole="alert">
          {loadError ?? 'Không tìm thấy bài đăng.'}
        </Text>
        <Button
          minH={44}
          onPress={backToItem}
          accessibilityRole="button"
          accessibilityLabel="Quay lại bài đăng"
        >
          Quay lại
        </Button>
      </YStack>
    );
  }

  if (submitted) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="4">
        <Text
          color="color"
          fontSize="6"
          fontWeight="700"
          accessibilityRole="header"
        >
          Đã gửi báo cáo
        </Text>
        <Text color="color" text="center" accessibilityRole="alert">
          Báo cáo cho “{item.title}” đã được ghi nhận để xem xét.
        </Text>
        <Button
          minH={44}
          onPress={backToItem}
          accessibilityRole="button"
          accessibilityLabel="Quay lại bài đăng"
        >
          Quay lại bài đăng
        </Button>
      </YStack>
    );
  }

  return (
    <ScrollView flex={1} backgroundColor="background">
      <YStack p="4" gap="4">
        <Text
          color="color"
          fontSize="7"
          fontWeight="700"
          accessibilityRole="header"
        >
          Báo cáo bài đăng
        </Text>
        <Text color="color" opacity={0.8}>
          {item.title}
        </Text>
        <Text color="color" fontWeight="700" accessibilityRole="header">
          Chọn lý do
        </Text>
        <YStack gap="2">
          {REPORT_REASONS.map((option) => (
            <Button
              key={option}
              minH={48}
              onPress={() => setReason(option)}
              theme={reason === option ? 'active' : undefined}
              accessibilityRole="radio"
              accessibilityLabel={REASON_LABELS[option]}
              accessibilityState={{ checked: reason === option }}
            >
              {REASON_LABELS[option]}
            </Button>
          ))}
        </YStack>
        <Text color="color" fontWeight="700">
          Thông tin bổ sung (không bắt buộc)
        </Text>
        <TextArea
          value={details}
          onChangeText={setDetails}
          maxLength={500}
          placeholder="Mô tả ngắn gọn vấn đề (tối đa 500 ký tự)"
          accessibilityLabel="Thông tin bổ sung cho báo cáo"
          accessibilityHint="Không bắt buộc, tối đa 500 ký tự."
        />
        <Text
          color="color"
          opacity={0.7}
          text="right"
          accessibilityLabel={`${details.length} trên 500 ký tự`}
        >
          {details.length}/500
        </Text>
        {submitError ? (
          <Text color="color" accessibilityRole="alert">
            {submitError}
          </Text>
        ) : null}
        <Button
          theme="active"
          onPress={submitReport}
          disabled={isSubmitting}
          minH={48}
          accessibilityRole="button"
          accessibilityLabel={isSubmitting ? 'Đang gửi báo cáo' : 'Gửi báo cáo'}
          accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        </Button>
        <Button
          minH={44}
          onPress={backToItem}
          accessibilityRole="button"
          accessibilityLabel="Hủy báo cáo và quay lại bài đăng"
        >
          Hủy
        </Button>
      </YStack>
    </ScrollView>
  );
}

export default ItemReportScreen;
