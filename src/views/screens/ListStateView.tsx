/**
 * src/views/screens/ListStateView.tsx
 *
 * Component hiển thị các trạng thái danh sách dùng chung (CLO3, CLO5):
 * - loading: đang tải dữ liệu ban đầu
 * - error: lỗi tải dữ liệu có nút thử lại
 * - empty: danh sách rỗng kèm thông điệp tùy chỉnh
 * - loadingMore: đang tải thêm trang tiếp theo ở cuối danh sách
 * - loadMoreError: lỗi tải thêm trang tiếp theo
 *
 * Sử dụng hoàn toàn Tamagui Tokens/Themes, không chứa mã màu hex.
 */

import { Button, Spinner, Text, YStack } from 'tamagui';

export type ListStateType = 'loading' | 'error' | 'empty' | 'loadingMore' | 'loadMoreError';

export interface ListStateViewProps {
  type: ListStateType;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ListStateView({
  type,
  message,
  onRetry,
  retryLabel = 'Thử lại',
}: ListStateViewProps) {
  if (type === 'loading') {
    return (
      <YStack
        flex={1}
        items="center"
        justify="center"
        p="6"
        gap="3"
        accessibilityRole="progressbar"
        accessibilityLabel="Đang tải danh sách đồ dùng"
      >
        <Spinner size="large" color="primary" />
        <Text color="color" opacity={0.8} fontSize="3">
          {message ?? 'Đang tải danh sách đồ dùng...'}
        </Text>
      </YStack>
    );
  }

  if (type === 'error') {
    return (
      <YStack
        flex={1}
        items="center"
        justify="center"
        p="6"
        gap="3"
        accessibilityRole="alert"
      >
        <Text color="color" fontSize="5" fontWeight="700">
          Không thể tải dữ liệu
        </Text>
        <Text color="color" opacity={0.8} text="center" fontSize="3">
          {message ?? 'Đã có lỗi xảy ra trong quá trình nạp dữ liệu.'}
        </Text>
        {onRetry ? (
          <Button
            theme="active"
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={retryLabel}
          >
            {retryLabel}
          </Button>
        ) : null}
      </YStack>
    );
  }

  if (type === 'empty') {
    return (
      <YStack
        flex={1}
        items="center"
        justify="center"
        p="6"
        gap="3"
        accessibilityLabel="Danh sách trống"
      >
        <Text color="color" fontSize="5" fontWeight="700">
          Chưa có món đồ nào
        </Text>
        <Text color="color" opacity={0.8} text="center" fontSize="3">
          {message ?? 'Hiện chưa có món đồ nào phù hợp.'}
        </Text>
        {onRetry ? (
          <Button
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={retryLabel}
          >
            {retryLabel}
          </Button>
        ) : null}
      </YStack>
    );
  }

  if (type === 'loadingMore') {
    return (
      <YStack
        items="center"
        justify="center"
        py="4"
        gap="2"
        accessibilityRole="progressbar"
        accessibilityLabel="Đang tải thêm dữ liệu"
      >
        <Spinner size="small" color="primary" />
        <Text color="color" opacity={0.7} fontSize="2">
          {message ?? 'Đang tải thêm...'}
        </Text>
      </YStack>
    );
  }

  if (type === 'loadMoreError') {
    return (
      <YStack
        items="center"
        justify="center"
        py="4"
        gap="2"
        accessibilityRole="alert"
      >
        <Text color="color" opacity={0.8} fontSize="2">
          {message ?? 'Không thể tải thêm dữ liệu.'}
        </Text>
        {onRetry ? (
          <Button
            py="1"
            px="2.5"
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={retryLabel}
          >
            {retryLabel}
          </Button>
        ) : null}
      </YStack>
    );
  }

  return null;
}
