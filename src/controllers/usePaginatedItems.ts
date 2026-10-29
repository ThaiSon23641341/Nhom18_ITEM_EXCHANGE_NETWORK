/**
 * src/controllers/usePaginatedItems.ts
 *
 * Custom Hook điều khiển danh sách món đồ phân trang (MVC Controller).
 * Tuân thủ CLO2 (useReducer, useCallback, useMemo, useRef), CLO3 (4 trạng thái: loading, success, error, empty).
 *
 * HỢP ĐỒNG & CHẾ ĐỘ NẠP:
 * 1. Không có tiêu chí lọc: phân trang qua getItems(page, pageSize).
 * 2. Có tiêu chí lọc (keyword/category/condition/ownerId): nạp tất cả bằng limit 50,
 *    lưu ref, lọc bằng filterItems() và phân trang cục bộ từng pageSize món.
 *    -> Sau này Thành viên A nâng cấp service hỗ trợ lọc/tìm kiếm phía server thì
 *       có thể chuyển chế độ này thành server query trực tiếp.
 *
 * ĐỒNG BỘ DỮ LIỆU:
 * - Dùng module-level version counter và notifyItemsChanged() để cập nhật giữa các màn hình
 *   (Explore, MyItems) khi Thêm / Sửa / Xóa món đồ.
 * - Khi màn hình lấy lại focus (useFocusEffect), chỉ làm mới nếu version đã thay đổi.
 * - Thành viên A có thể thay thế cơ chế này bằng Redux trong tương lai.
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Item, ItemCondition } from '../models/itemModel';
import { getItems } from '../services/api/itemService';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { filterItems } from '../utils/itemFilters';

// ─── Module-level Version Counter ───────────────────────────────────────────
// A có thể thay thế bằng Redux store trong tương lai.
let globalDataVersion = 0;
const changeListeners = new Set<() => void>();

/**
 * Thông báo dữ liệu món đồ đã thay đổi (sau khi tạo, sửa hoặc xóa).
 * Các màn hình đăng ký sẽ tự động nạp lại khi cần.
 */
export function notifyItemsChanged(): void {
  globalDataVersion += 1;
  changeListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Tránh lỗi từ listener ngoài tầm kiểm soát
    }
  });
}

// ─── Kiểu dữ liệu ───────────────────────────────────────────────────────────

export interface ItemQueryParams {
  keyword?: string;
  category?: string;
  condition?: ItemCondition | string;
  ownerId?: string;
}

export interface UsePaginatedItemsOptions {
  query?: ItemQueryParams;
  pageSize?: number;
}

export type LoadingStatus = 'loading' | 'success' | 'error';

export interface PaginatedItemsState {
  items: Item[];
  total: number;
  status: LoadingStatus;
  errorMessage: string | null;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  hasMore: boolean;
  page: number;
}

type Action =
  | { type: 'FETCH_INIT'; isRefresh: boolean }
  | { type: 'FETCH_SUCCESS'; items: Item[]; total: number; hasMore: boolean; page: number }
  | { type: 'FETCH_ERROR'; errorMessage: string }
  | { type: 'LOAD_MORE_INIT' }
  | { type: 'LOAD_MORE_SUCCESS'; items: Item[]; hasMore: boolean; page: number }
  | { type: 'LOAD_MORE_ERROR'; errorMessage: string }
  | { type: 'REMOVE_ITEM'; id: string };

const initialState: PaginatedItemsState = {
  items: [],
  total: 0,
  status: 'loading',
  errorMessage: null,
  isRefreshing: false,
  isLoadingMore: false,
  loadMoreError: null,
  hasMore: false,
  page: 1,
};

function paginatedReducer(state: PaginatedItemsState, action: Action): PaginatedItemsState {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        status: action.isRefresh ? state.status : 'loading',
        isRefreshing: action.isRefresh,
        errorMessage: null,
        loadMoreError: null,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'success',
        items: action.items,
        total: action.total,
        hasMore: action.hasMore,
        page: action.page,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: null,
        loadMoreError: null,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        errorMessage: action.errorMessage,
        isRefreshing: false,
        isLoadingMore: false,
      };

    case 'LOAD_MORE_INIT':
      return {
        ...state,
        isLoadingMore: true,
        loadMoreError: null,
      };

    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        items: action.items,
        hasMore: action.hasMore,
        page: action.page,
        isLoadingMore: false,
        loadMoreError: null,
      };

    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        isLoadingMore: false,
        loadMoreError: action.errorMessage,
      };

    case 'REMOVE_ITEM': {
      const nextItems = state.items.filter((item) => item.id !== action.id);
      return {
        ...state,
        items: nextItems,
        total: Math.max(0, state.total - 1),
      };
    }

    default:
      return state;
  }
}

// ─── Custom Hook chính ──────────────────────────────────────────────────────

export function usePaginatedItems(options?: UsePaginatedItemsOptions) {
  const { query, pageSize = 8 } = options ?? {};

  const [state, dispatch] = useReducer(paginatedReducer, initialState);

  // Lưu requestId để loại bỏ các kết quả trả về muộn (race condition)
  const requestIdRef = useRef(0);

  // Bộ nhớ đệm nạp toàn bộ danh sách khi có tiêu chí lọc
  const cachedAllItemsRef = useRef<Item[] | null>(null);
  const filteredAllItemsRef = useRef<Item[]>([]);

  // Phiên bản dữ liệu cục bộ để kiểm tra khi focus lại màn hình
  const localVersionRef = useRef(globalDataVersion);

  const keyword = query?.keyword?.trim() ?? '';
  const category = query?.category?.trim() ?? '';
  const condition = query?.condition?.trim() ?? '';
  const ownerId = query?.ownerId?.trim() ?? '';

  // Xác định xem có ít nhất một tiêu chí lọc hợp lệ hay không
  const hasActiveFilters = Boolean(keyword || category || condition || ownerId);

  // Lưu query hiện tại vào ref để dùng trong callback mà không bị thay đổi tham chiếu
  const queryRef = useRef<ItemQueryParams | undefined>(query);
  queryRef.current = query;

  // ─── Hàm nạp dữ liệu trang đầu (hoặc làm mới) ─────────────────────────────
  const loadFirstPage = useCallback(
    async (isRefresh = false) => {
      const currentRequestId = ++requestIdRef.current;
      dispatch({ type: 'FETCH_INIT', isRefresh });

      try {
        if (!hasActiveFilters) {
          // CHẾ ĐỘ 1: Không có tiêu chí lọc -> phân trang server thực sự
          const response = await getItems(1, pageSize);

          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          dispatch({
            type: 'FETCH_SUCCESS',
            items: response.data,
            total: response.total,
            hasMore: response.hasMore,
            page: 1,
          });
        } else {
          // CHẾ ĐỘ 2: Có tiêu chí lọc -> nạp toàn bộ với limit 50, lưu cache và lọc
          // [Sau này thay bằng server filter khi A nâng cấp itemService]
          if (cachedAllItemsRef.current === null || isRefresh) {
            const allItemsResponse = await getItems(1, 50);
            cachedAllItemsRef.current = allItemsResponse.data;
          }

          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          // Lọc danh sách bằng pure function filterItems
          const filtered = filterItems(cachedAllItemsRef.current ?? [], queryRef.current);
          filteredAllItemsRef.current = filtered;

          const totalFiltered = filtered.length;
          const pageItems = filtered.slice(0, pageSize);
          const hasMore = pageItems.length < totalFiltered;

          dispatch({
            type: 'FETCH_SUCCESS',
            items: pageItems,
            total: totalFiltered,
            hasMore,
            page: 1,
          });
        }
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        dispatch({
          type: 'FETCH_ERROR',
          errorMessage: getApiErrorMessage(error),
        });
      }
    },
    [hasActiveFilters, pageSize]
  );

  // ─── Tải thêm trang tiếp theo (Load More) ─────────────────────────────────
  const loadMore = useCallback(async () => {
    // Không gọi khi đang nạp, hết trang hoặc đang có lỗi
    if (
      state.status === 'loading' ||
      state.isLoadingMore ||
      !state.hasMore ||
      state.status === 'error' ||
      state.loadMoreError
    ) {
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    dispatch({ type: 'LOAD_MORE_INIT' });

    try {
      if (!hasActiveFilters) {
        // Chế độ 1: gọi tiếp API server trang kế tiếp
        const nextPage = state.page + 1;
        const response = await getItems(nextPage, pageSize);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // Loại bỏ các món trùng id khi nối trang
        const existingIds = new Set(state.items.map((i) => i.id));
        const newUniqueItems = response.data.filter((i) => !existingIds.has(i.id));

        dispatch({
          type: 'LOAD_MORE_SUCCESS',
          items: [...state.items, ...newUniqueItems],
          hasMore: response.hasMore,
          page: nextPage,
        });
      } else {
        // Chế độ 2: lấy thêm từ filteredAllItemsRef đã lọc
        const nextPage = state.page + 1;
        const totalFiltered = filteredAllItemsRef.current.length;
        const nextSlice = filteredAllItemsRef.current.slice(0, nextPage * pageSize);
        const hasMore = nextSlice.length < totalFiltered;

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        dispatch({
          type: 'LOAD_MORE_SUCCESS',
          items: nextSlice,
          hasMore,
          page: nextPage,
        });
      }
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      dispatch({
        type: 'LOAD_MORE_ERROR',
        errorMessage: getApiErrorMessage(error),
      });
    }
  }, [hasActiveFilters, pageSize, state.hasMore, state.isLoadingMore, state.items, state.loadMoreError, state.page, state.status]);

  // ─── Làm mới (Refresh) ───────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    cachedAllItemsRef.current = null;
    localVersionRef.current = globalDataVersion;
    await loadFirstPage(true);
  }, [loadFirstPage]);

  // ─── Thử lại khi có lỗi (Retry) ──────────────────────────────────────────
  const retry = useCallback(() => {
    if (state.loadMoreError) {
      loadMore();
    } else {
      loadFirstPage(false);
    }
  }, [loadFirstPage, loadMore, state.loadMoreError]);

  // ─── Xóa món đồ theo id khỏi danh sách ───────────────────────────────────
  const removeItemById = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
    if (cachedAllItemsRef.current) {
      cachedAllItemsRef.current = cachedAllItemsRef.current.filter((item) => item.id !== id);
    }
    if (filteredAllItemsRef.current) {
      filteredAllItemsRef.current = filteredAllItemsRef.current.filter((item) => item.id !== id);
    }
  }, []);

  // ─── Nạp trang đầu khi đổi query hoặc khởi tạo ───────────────────────────
  useEffect(() => {
    loadFirstPage(false);
    // Cleanup khi component unmount: hủy các request đang chờ xử lý
    return () => {
      requestIdRef.current += 1;
    };
  }, [keyword, category, condition, ownerId, pageSize, loadFirstPage]);

  // ─── Lắng nghe thay đổi dữ liệu từ module (notifyItemsChanged) ───────────
  useEffect(() => {
    const handleItemsChanged = () => {
      cachedAllItemsRef.current = null;
      localVersionRef.current = globalDataVersion;
      loadFirstPage(true);
    };

    changeListeners.add(handleItemsChanged);
    return () => {
      changeListeners.delete(handleItemsChanged);
    };
  }, [loadFirstPage]);

  // ─── Tự làm mới khi lấy lại focus nếu phiên bản dữ liệu đã đổi ───────────
  useFocusEffect(
    useCallback(() => {
      if (localVersionRef.current !== globalDataVersion) {
        localVersionRef.current = globalDataVersion;
        cachedAllItemsRef.current = null;
        loadFirstPage(true);
      }
    }, [loadFirstPage])
  );

  return {
    items: state.items,
    total: state.total,
    status: state.status,
    errorMessage: state.errorMessage,
    isRefreshing: state.isRefreshing,
    isLoadingMore: state.isLoadingMore,
    loadMoreError: state.loadMoreError,
    hasMore: state.hasMore,
    loadMore,
    refresh,
    retry,
    removeItemById,
  };
}
