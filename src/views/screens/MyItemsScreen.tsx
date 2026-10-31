import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Redirect } from 'expo-router';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { useMyItemsController } from '../../controllers/useMyItemsController';
import { showConfirmDialog } from '../components/ConfirmDialog';
import { ItemListRow } from './ItemListRow';
import { ListStateView } from './ListStateView';
import { getAccessibilityProps } from '../../utils/accessibility';

export function MyItemsScreen() {
  const controller = useMyItemsController();
  const { items, status, errorMessage, retry, refresh, isRefreshing, loadMore, isLoadingMore, loadMoreError, total } = controller;

  const renderItem = useCallback(({ item }: { item: Item }) => {
    const warning = item.status === 'reserved' ? 'Món đang giữ; hãy cẩn thận khi sửa hoặc xóa.' : undefined;
    return (
      <ItemListRow
        item={item}
        actions={
          <YStack gap="2">
            {warning ? <Text color="color" opacity={0.8} fontSize="2">{warning}</Text> : null}
            {item.status === 'exchanged' ? (
              <Text color="color" opacity={0.8} fontSize="2">Món đã trao không thể chỉnh sửa hoặc xóa.</Text>
            ) : null}
            <XStack gap="2" justify="flex-end">
              <Button theme="active" disabled={item.status === 'exchanged' || controller.deletingId === item.id} onPress={() => controller.openEdit(item.id)}>Sửa</Button>
              <Button
                backgroundColor="border-color"
                color="color"
                disabled={controller.deletingId === item.id}
                onPress={() => {
                  controller.requestDelete(item);
                  const strongWarning = item.status === 'reserved'
                    ? ' Món này đang giữ cho người đặt lịch; xóa có thể làm gián đoạn trao đổi.'
                    : '';
                  showConfirmDialog({
                    title: 'Xóa bài đăng?',
                    message: `Bạn có chắc muốn xóa “${item.title}”? Hành động này không thể hoàn tác.${strongWarning}`,
                    confirmLabel: 'Xóa',
                    cancelLabel: 'Hủy',
                    destructive: true,
                    isLoading: controller.deletingId === item.id,
                    onConfirm: () => { void controller.confirmDelete(item); },
                    onCancel: controller.cancelDelete,
                  });
                }}
              >{controller.deletingId === item.id ? 'Đang xóa...' : 'Xóa'}</Button>
            </XStack>
          </YStack>
        }
      />
    );
  }, [controller]);

  if (!controller.user) return <Redirect href="/login" />;

  return (
    <YStack flex={1} backgroundColor="background" p="3">
      <XStack justify="space-between" items="center" mb="3">
        <YStack>
          <Text color="color" fontSize="6" fontWeight="700">Bài đăng của tôi</Text>
          <Text color="color" opacity={0.7} fontSize="2">{total} món đồ</Text>
        </YStack>
        <Button theme="active" onPress={controller.openCreate}>Đăng đồ mới</Button>
      </XStack>

      {controller.deleteError ? <Text color="color" mb="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.deleteError}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isLoadingMore ? () => <Spinner color="primary" /> : loadMoreError ? () => <ListStateView type="loadMoreError" message={loadMoreError} onRetry={loadMore} /> : undefined}
        ListEmptyComponent={status === 'loading' ? <ListStateView type="loading" /> : status === 'error' ? <ListStateView type="error" message={errorMessage ?? undefined} onRetry={retry} /> : <ListStateView type="empty" message="Bạn chưa đăng món đồ nào." onRetry={controller.openCreate} retryLabel="Đăng món đầu tiên" />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        keyboardShouldPersistTaps="handled"
      />
    </YStack>
  );
}

export default MyItemsScreen;
