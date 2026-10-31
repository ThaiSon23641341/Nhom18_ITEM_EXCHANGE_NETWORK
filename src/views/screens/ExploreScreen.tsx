/**
 * src/views/screens/ExploreScreen.tsx
 *
 * Màn hình Khám phá chính thức (B19 Danh sách, B20 Tìm kiếm, B21 Lọc).
 * - Thanh tìm kiếm và bộ lọc đặt phía trên FlatList (không đưa vào ListHeaderComponent
 *   để giữ bàn phím ổn định khi gõ).
 * - FlatList phân trang, kéo làm mới (RefreshControl), tải thêm khi cuộn đến 0.4.
 * - Đầy đủ 4 trạng thái CLO3 (đang tải, thành công, lỗi có nút thử lại, rỗng).
 * - Rỗng khi tìm/lọc hiển thị câu thông báo khác rỗng thông thường và có nút Xóa bộ lọc.
 * - Toàn bộ giao diện dùng Tamagui Tokens/Themes (CLO5), không chứa mã màu hex.
 */

import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { useItemController } from '../../controllers/useItemController';
import { ItemFilterBar } from './ItemFilterBar';
import { ItemListRow } from './ItemListRow';
import { ListStateView } from './ListStateView';

export function ExploreScreen() {
  const {
    items,
    total,
    status,
    errorMessage,
    isRefreshing,
    isLoadingMore,
    loadMoreError,
    loadMore,
    refresh,
    retry,
    keyword,
    setKeyword,
    category,
    setCategory,
    condition,
    setCondition,
    hasActiveFilters,
    clearFilters,
    openItem,
  } = useItemController();

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <ItemListRow item={item} onPress={() => openItem(item.id)} />
    ),
    [openItem]
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return <ListStateView type="loadingMore" />;
    }
    if (loadMoreError) {
      return (
        <ListStateView
          type="loadMoreError"
          message={loadMoreError}
          onRetry={loadMore}
          retryLabel="Thử tải lại"
        />
      );
    }
    return null;
  }, [isLoadingMore, loadMore, loadMoreError]);

  const renderEmpty = useCallback(() => {
    if (status === 'loading') {
      return <ListStateView type="loading" />;
    }
    if (status === 'error') {
      return (
        <ListStateView
          type="error"
          message={errorMessage ?? undefined}
          onRetry={retry}
        />
      );
    }
    if (hasActiveFilters) {
      return (
        <ListStateView
          type="empty"
          message="Không tìm thấy món đồ phù hợp với từ khóa hoặc bộ lọc đã chọn."
          onRetry={clearFilters}
          retryLabel="Xóa bộ lọc"
        />
      );
    }
    return (
      <ListStateView
        type="empty"
        message="Hiện chưa có món đồ nào được đăng tải trên hệ thống."
      />
    );
  }, [clearFilters, errorMessage, hasActiveFilters, retry, status]);

  return (
    <YStack flex={1} backgroundColor="background" p="3">
      {/* Thanh tìm kiếm và bộ lọc cố định phía trên */}
      <ItemFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        selectedCategory={category}
        onSelectCategory={setCategory}
        selectedCondition={condition}
        onSelectCondition={setCondition}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalResults={total}
      />

      {/* Danh sách phân trang bên dưới */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        keyboardShouldPersistTaps="handled"
      />
    </YStack>
  );
}

export default ExploreScreen;
