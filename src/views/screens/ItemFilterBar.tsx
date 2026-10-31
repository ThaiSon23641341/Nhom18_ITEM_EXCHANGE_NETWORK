/**
 * src/views/screens/ItemFilterBar.tsx
 *
 * Thanh tìm kiếm và bộ lọc đa tiêu chí (B20, B21, CLO5).
 * - Ô nhập tìm kiếm Tamagui Input có nút xóa nội dung nhanh.
 * - Hai hàng chip cuộn ngang cho Danh mục và Tình trạng.
 * - Chip dùng Button với theme active tương tự ItemReportScreen.
 * - Dòng tóm tắt số kết quả và nút Xóa bộ lọc.
 * - Sử dụng hoàn toàn Tamagui Tokens/Themes, không có mã màu hex.
 */

import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import type { ItemCondition } from '../../models/itemModel';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from '../../utils/itemOptions';

export interface ItemFilterBarProps {
  keyword: string;
  onKeywordChange: (text: string) => void;
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
  selectedCondition?: ItemCondition;
  onSelectCondition: (condition?: ItemCondition) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalResults: number;
}

export function ItemFilterBar({
  keyword,
  onKeywordChange,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  hasActiveFilters,
  onClearFilters,
  totalResults,
}: ItemFilterBarProps) {
  return (
    <YStack gap="2" pb="2">
      {/* Ô tìm kiếm từ khóa kèm nút xóa */}
      <XStack items="center" gap="2">
        <Input
          flex={1}
          value={keyword}
          onChangeText={onKeywordChange}
          placeholder="Tìm theo tên món đồ..."
          accessibilityLabel="Ô tìm kiếm theo tên món đồ"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {keyword.trim().length > 0 ? (
          <Button
            px="3"
            py="2"
            onPress={() => onKeywordChange('')}
            accessibilityLabel="Xóa từ khóa tìm kiếm"
            accessibilityRole="button"
          >
            ✕
          </Button>
        ) : null}
      </XStack>

      {/* Hàng chip cuộn ngang 1: Danh mục */}
      <YStack gap="1">
        <Text color="color" opacity={0.7} fontSize="1" fontWeight="700">
          DANH MỤC
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          <Button
            px="3"
            py="1.5"
            theme={!selectedCategory ? 'active' : undefined}
            onPress={() => onSelectCategory(undefined)}
            accessibilityRole="radio"
            accessibilityState={{ checked: !selectedCategory }}
            accessibilityLabel="Chọn tất cả danh mục"
          >
            Tất cả
          </Button>
          {CATEGORY_OPTIONS.map((opt) => {
            const isSelected = selectedCategory === opt.value;
            return (
              <Button
                key={opt.value}
                px="3"
                py="1.5"
                theme={isSelected ? 'active' : undefined}
                onPress={() => onSelectCategory(isSelected ? undefined : opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Lọc danh mục ${opt.label}`}
              >
                {opt.label}
              </Button>
            );
          })}
        </ScrollView>
      </YStack>

      {/* Hàng chip cuộn ngang 2: Tình trạng */}
      <YStack gap="1">
        <Text color="color" opacity={0.7} fontSize="1" fontWeight="700">
          TÌNH TRẠNG
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          <Button
            px="3"
            py="1.5"
            theme={!selectedCondition ? 'active' : undefined}
            onPress={() => onSelectCondition(undefined)}
            accessibilityRole="radio"
            accessibilityState={{ checked: !selectedCondition }}
            accessibilityLabel="Chọn tất cả tình trạng"
          >
            Tất cả
          </Button>
          {CONDITION_OPTIONS.map((opt) => {
            const isSelected = selectedCondition === opt.value;
            return (
              <Button
                key={opt.value}
                px="3"
                py="1.5"
                theme={isSelected ? 'active' : undefined}
                onPress={() => onSelectCondition(isSelected ? undefined : opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Lọc tình trạng ${opt.label}`}
              >
                {opt.label}
              </Button>
            );
          })}
        </ScrollView>
      </YStack>

      {/* Dòng tóm tắt số kết quả và nút xóa bộ lọc */}
      <XStack justify="space-between" items="center" pt="1">
        <Text color="color" opacity={0.75} fontSize="2">
          Tìm thấy {totalResults} món đồ
        </Text>
        {hasActiveFilters ? (
          <Button
            px="2.5"
            py="1"
            onPress={onClearFilters}
            accessibilityLabel="Xóa toàn bộ bộ lọc"
            accessibilityRole="button"
          >
            Xóa bộ lọc
          </Button>
        ) : null}
      </XStack>
    </YStack>
  );
}

export default ItemFilterBar;
