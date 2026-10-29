/**
 * src/controllers/useItemController.ts
 *
 * Custom Hook điều khiển màn hình Khám phá (ExploreScreen).
 * Bọc usePaginatedItems, quản lý trạng thái tìm kiếm (debounce 400ms) và lọc danh mục / tình trạng.
 * Tuân thủ MVC: chỉ chứa logic và trạng thái, không chứa JSX.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { ItemCondition } from '../models/itemModel';
import { usePaginatedItems, type ItemQueryParams } from './usePaginatedItems';

export function useItemController() {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [condition, setCondition] = useState<ItemCondition | undefined>(undefined);

  // Trì hoãn từ khóa 400ms để tránh gửi request liên tục khi người dùng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [keyword]);

  // Gom các tiêu chí thành query ổn định (useMemo)
  const query = useMemo<ItemQueryParams>(
    () => ({
      keyword: debouncedKeyword,
      category,
      condition,
    }),
    [debouncedKeyword, category, condition]
  );

  // Gọi hook phân trang cốt lõi
  const paginatedResult = usePaginatedItems({ query, pageSize: 8 });

  // Kiểm tra xem đang có bộ lọc nào được kích hoạt hay không
  const hasActiveFilters = Boolean(
    keyword.trim().length > 0 ||
      (category && category.trim().length > 0) ||
      (condition && condition.trim().length > 0)
  );

  // Xóa toàn bộ các bộ lọc đang chọn
  const clearFilters = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    setCategory(undefined);
    setCondition(undefined);
  }, []);

  // Chuyển hướng sang màn hình xem chi tiết món đồ
  const openItem = useCallback((id: string) => {
    router.push(`/item/${id}` as const);
  }, []);

  return {
    ...paginatedResult,
    keyword,
    setKeyword,
    category,
    setCategory,
    condition,
    setCondition,
    hasActiveFilters,
    clearFilters,
    openItem,
  };
}
