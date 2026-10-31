import { Button, ScrollView, Text, YStack } from 'tamagui';
import type { ItemReport, ReportReason } from '../../models/reportModel';
import { useReportModerationController } from '../../controllers/useReportModerationController';
import { getAccessibilityProps } from '../../utils/accessibility';

const REASON_LABELS: Record<ReportReason, string> = {
  prohibited_item: 'Mặt hàng bị cấm',
  misleading_information: 'Thông tin sai lệch',
  inappropriate_content: 'Nội dung không phù hợp',
  suspected_scam: 'Nghi ngờ lừa đảo',
  other: 'Lý do khác',
};

const STATUS_LABELS: Record<ItemReport['status'], string> = {
  pending: 'Đang chờ xem xét',
  actioned: 'Đã xử lý',
  dismissed: 'Đã bỏ qua',
};

export function ReportModerationScreen() {
  const {
    result,
    page,
    isLoading,
    error,
    actionError,
    updatingReportId,
    loadReports,
    resolveReport,
  } = useReportModerationController();

  return (
    <ScrollView flex={1} backgroundColor="background">
      <YStack p="4" gap="4">
        <Text color="color" fontSize="7" fontWeight="700">
          Hàng chờ báo cáo
        </Text>
        <Text color="color" opacity={0.8} {...getAccessibilityProps({ role: 'alert' })}>
          Bản demo dùng dữ liệu trong bộ nhớ, chưa có xác thực moderator hoặc
          phân quyền phía máy chủ. Không dùng màn hình này trong production.
        </Text>
        <Button onPress={() => loadReports(page)} disabled={isLoading}>
          Tải lại
        </Button>

        {isLoading ? <Text color="color">Đang tải báo cáo...</Text> : null}

        {error ? (
          <YStack gap="2">
            <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>
              {error}
            </Text>
            <Button onPress={() => loadReports(page)}>Thử lại</Button>
          </YStack>
        ) : null}

        {!isLoading && !error && result?.total === 0 ? (
          <Text color="color">Chưa có báo cáo nào.</Text>
        ) : null}

        {result?.data.map((report) => (
          <YStack
            key={report.id}
            borderWidth={1}
            borderColor="border-color"
            rounded="4"
            p="4"
            gap="2"
          >
            <Text color="color" fontWeight="700">
              {REASON_LABELS[report.reason]}
            </Text>
            <Text color="color">Mã báo cáo: {report.id}</Text>
            <Text color="color">Mã bài đăng: {report.itemId}</Text>
            <Text color="color">Người gửi: {report.reporterId}</Text>
            <Text color="color">Trạng thái: {STATUS_LABELS[report.status]}</Text>
            {report.details ? <Text color="color">{report.details}</Text> : null}
            {report.status === 'pending' ? (
              <YStack gap="2" mt="2">
                <Button
                  theme="active"
                  onPress={() => resolveReport(report.id, 'actioned')}
                  disabled={updatingReportId === report.id}
                >
                  {updatingReportId === report.id ? 'Đang cập nhật...' : 'Đánh dấu đã xử lý'}
                </Button>
                <Button
                  onPress={() => resolveReport(report.id, 'dismissed')}
                  disabled={updatingReportId === report.id}
                >
                  Bỏ qua báo cáo
                </Button>
              </YStack>
            ) : null}
          </YStack>
        ))}

        {actionError ? (
          <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>
            {actionError}
          </Text>
        ) : null}

        {result && result.totalPages > 1 ? (
          <YStack gap="2">
            <Text color="color" text="center">
              Trang {page}/{result.totalPages}
            </Text>
            <Button
              onPress={() => loadReports(page - 1)}
              disabled={isLoading || page <= 1}
            >
              Trang trước
            </Button>
            <Button
              onPress={() => loadReports(page + 1)}
              disabled={isLoading || !result.hasMore}
            >
              Trang tiếp
            </Button>
          </YStack>
        ) : null}
      </YStack>
    </ScrollView>
  );
}

export default ReportModerationScreen;
