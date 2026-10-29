/**
 * src/controllers/usePaginatedItems.test.ts
 *
 * Kiểm thử đơn vị cho custom hook usePaginatedItems.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { Item, ItemPaginationResponse } from '../models/itemModel';
import * as itemService from '../services/api/itemService';
import { usePaginatedItems } from './usePaginatedItems';

// Giả lập expo-router để không phụ thuộc NavigationContainer trong unit test
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Giả lập itemService
jest.mock('../services/api/itemService', () => ({
  getItems: jest.fn(),
}));

const mockGetItems = itemService.getItems as jest.MockedFunction<typeof itemService.getItems>;

const createSampleItems = (count: number, prefix = 'item'): Item[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    title: `Món đồ ${index + 1}`,
    description: `Mô tả chi tiết món đồ ${index + 1}`,
    category: index % 2 === 0 ? 'Giao trinh' : 'Thiet bi dien tu',
    condition: index % 3 === 0 ? 'new' : 'good',
    imageUrl: '',
    status: 'available',
    ownerId: index === 0 ? 'user-001' : 'user-002',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  }));

describe('usePaginatedItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('tải trang đầu tiên thành công ở chế độ không có bộ lọc', async () => {
    const sampleItems = createSampleItems(8);
    const mockResponse: ItemPaginationResponse = {
      data: sampleItems,
      page: 1,
      limit: 8,
      total: 18,
      totalPages: 3,
      hasMore: true,
    };
    mockGetItems.mockResolvedValueOnce(mockResponse);

    const { result } = await renderHook(() => usePaginatedItems({ pageSize: 8 }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.items).toHaveLength(8);
    expect(result.current.total).toBe(18);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.errorMessage).toBeNull();
    expect(mockGetItems).toHaveBeenCalledWith(1, 8);
  });

  test('gọi loadMore() thành công và nối thêm dữ liệu không bị trùng id', async () => {
    const page1Items = createSampleItems(8);
    const page2Items = [
      page1Items[7], // món cố tình trùng để kiểm tra deduplication
      ...createSampleItems(7, 'item-page2'),
    ];

    mockGetItems
      .mockResolvedValueOnce({
        data: page1Items,
        page: 1,
        limit: 8,
        total: 18,
        totalPages: 3,
        hasMore: true,
      })
      .mockResolvedValueOnce({
        data: page2Items,
        page: 2,
        limit: 8,
        total: 18,
        totalPages: 3,
        hasMore: true,
      });

    const { result } = await renderHook(() => usePaginatedItems({ pageSize: 8 }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.items).toHaveLength(8);

    await act(async () => {
      await result.current.loadMore();
    });

    // 8 món trang 1 + 7 món mới trang 2 (đã loại 1 món trùng) = 15 món
    expect(result.current.items).toHaveLength(15);
    expect(mockGetItems).toHaveBeenCalledWith(2, 8);
  });

  test('không gọi loadMore() khi đang tải hoặc khi hasMore là false', async () => {
    mockGetItems.mockResolvedValueOnce({
      data: createSampleItems(4),
      page: 1,
      limit: 8,
      total: 4,
      totalPages: 1,
      hasMore: false,
    });

    const { result } = await renderHook(() => usePaginatedItems({ pageSize: 8 }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    // Không có lần gọi thứ 2
    expect(mockGetItems).toHaveBeenCalledTimes(1);
  });

  test('xử lý trạng thái lỗi và thử lại (retry) thành công', async () => {
    mockGetItems
      .mockRejectedValueOnce(new Error('Mạng không ổn định'))
      .mockResolvedValueOnce({
        data: createSampleItems(8),
        page: 1,
        limit: 8,
        total: 8,
        totalPages: 1,
        hasMore: false,
      });

    const { result } = await renderHook(() => usePaginatedItems({ pageSize: 8 }));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toBe('Mạng không ổn định');

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.items).toHaveLength(8);
  });

  test('hoạt động chuẩn xác ở chế độ có bộ lọc (nạp tất cả và lọc bộ nhớ)', async () => {
    const allItems: Item[] = [
      {
        id: 'item-001',
        title: 'Giáo trình Lập trình C',
        description: 'Sách hay',
        category: 'Giao trinh',
        condition: 'good',
        imageUrl: '',
        status: 'available',
        ownerId: 'user-001',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'item-002',
        title: 'Tai nghe Bluetooth',
        description: 'Âm thanh tốt',
        category: 'Thiet bi dien tu',
        condition: 'new',
        imageUrl: '',
        status: 'available',
        ownerId: 'user-002',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
    ];

    mockGetItems.mockResolvedValueOnce({
      data: allItems,
      page: 1,
      limit: 50,
      total: 2,
      totalPages: 1,
      hasMore: false,
    });

    const { result } = await renderHook(() =>
      usePaginatedItems({
        query: { keyword: 'bluetooth' },
        pageSize: 8,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(mockGetItems).toHaveBeenCalledWith(1, 50);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('item-002');
  });

  test('removeItemById() xóa món đồ khỏi danh sách', async () => {
    const items = createSampleItems(3);
    mockGetItems.mockResolvedValueOnce({
      data: items,
      page: 1,
      limit: 8,
      total: 3,
      totalPages: 1,
      hasMore: false,
    });

    const { result } = await renderHook(() => usePaginatedItems({ pageSize: 8 }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.items).toHaveLength(3);

    await act(async () => {
      result.current.removeItemById('item-002');
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    expect(result.current.items.some((i) => i.id === 'item-002')).toBe(false);
    expect(result.current.total).toBe(2);
  });
});
