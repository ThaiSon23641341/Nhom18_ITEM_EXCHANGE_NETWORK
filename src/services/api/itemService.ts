import type { CreateItemInput, Item, ItemPaginationResponse, UpdateItemInput } from '../../models';
import { ApiClientError, apiRequest } from './apiClient';
const itemChangeListeners = new Set<() => void>();

export class MockApiError extends Error {
  constructor(
    message: string,
    public readonly code: 'BAD_REQUEST' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'CONFLICT',
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}

const cloneItem = (item: Item): Item => ({
  ...item,
  ...(item.imageUrls ? { imageUrls: [...item.imageUrls] } : {}),
});

const toMockApiError = (error: unknown): MockApiError => {
  if (error instanceof ApiClientError) {
    const code = error.code === 'NOT_FOUND'
      ? 'NOT_FOUND'
      : error.code === 'CONFLICT'
        ? 'CONFLICT'
        : error.code === 'NETWORK_ERROR'
          ? 'NETWORK_ERROR'
          : 'BAD_REQUEST';
    return new MockApiError(error.message, code);
  }
  if (error instanceof Error) {
    return new MockApiError(error.message, 'BAD_REQUEST');
  }
  return new MockApiError('Yêu cầu bài đăng không thành công.', 'BAD_REQUEST');
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  try {
    return await apiRequest<T>(path, init);
  } catch (error) {
    throw toMockApiError(error);
  }
};

const makeItemId = (): string =>
  `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const validateItem = (itemData: CreateItemInput): void => {
  if (
    !itemData.title.trim()
    || !itemData.ownerId.trim()
    || !itemData.description.trim()
    || !itemData.category.trim()
  ) {
    throw new MockApiError(
      'Title, description, category, and owner are required.',
      'BAD_REQUEST',
    );
  }
  if (
    itemData.title.trim().length > 120
    || itemData.description.trim().length > 2000
    || itemData.category.trim().length > 80
    || (itemData.location?.trim().length ?? 0) > 200
  ) {
    throw new MockApiError('Item details exceed the allowed length.', 'BAD_REQUEST');
  }
  if (
    itemData.priceVnd !== undefined
    && (!Number.isSafeInteger(itemData.priceVnd) || itemData.priceVnd < 0)
  ) {
    throw new MockApiError('Price must be a non-negative integer.', 'BAD_REQUEST');
  }
  if (
    (itemData.imageUrls?.length ?? 0) > 5
    || itemData.imageUrls?.some((imageUrl) => imageUrl.length > 2048)
  ) {
    throw new MockApiError('An item can have at most 5 valid images.', 'BAD_REQUEST');
  }
};

const notifyItemChanges = (): void => {
  itemChangeListeners.forEach((listener) => listener());
};

export const subscribeToItemChanges = (listener: () => void): (() => void) => {
  itemChangeListeners.add(listener);
  return () => {
    itemChangeListeners.delete(listener);
  };
};

export const getItems = async (page: number, limit: number): Promise<ItemPaginationResponse> => {
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    throw new MockApiError('Page and limit must be positive integers.', 'BAD_REQUEST');
  }

  const items = await request<Item[]>('/items?_sort=createdAt&_order=desc');
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit).map(cloneItem),
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};

export const getItemById = async (id: string): Promise<Item> => {
  return cloneItem(await request<Item>(`/items/${encodeURIComponent(id)}`));
};

export const createItem = async (itemData: CreateItemInput): Promise<Item> => {
  validateItem(itemData);
  const item = await request<Item>('/items', {
    method: 'POST',
    body: JSON.stringify({ ...itemData, id: makeItemId() }),
  });
  notifyItemChanges();
  return cloneItem(item);
};

export const updateItem = async (id: string, itemData: UpdateItemInput): Promise<Item> => {
  if (itemData.priceVnd !== undefined && itemData.priceVnd !== null
    && (!Number.isSafeInteger(itemData.priceVnd) || itemData.priceVnd < 0)) {
    throw new MockApiError('Price must be a non-negative integer.', 'BAD_REQUEST');
  }
  if (itemData.imageUrls && (
    itemData.imageUrls.length > 5
    || itemData.imageUrls.some((imageUrl) => imageUrl.length > 2048)
  )) {
    throw new MockApiError('An item can have at most 5 valid images.', 'BAD_REQUEST');
  }
  const updated = await request<Item>(`/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
  notifyItemChanges();
  return cloneItem(updated);
};

export const deleteItem = async (id: string): Promise<void> => {
  await request<void>(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
  notifyItemChanges();
};