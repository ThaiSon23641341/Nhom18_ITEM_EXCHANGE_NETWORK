import { CreateItemInput, Item, ItemPaginationResponse, UpdateItemInput } from '../../models';
import { MOCK_ITEMS } from './mockData';

const API_DELAY_MS = 500;
let items = MOCK_ITEMS.map((item) => ({ ...item }));
let nextItemId = items.length + 1;
const itemChangeListeners = new Set<() => void>();

export class MockApiError extends Error {
  constructor(message: string, public readonly code: 'BAD_REQUEST' | 'NOT_FOUND') {
    super(message);
    this.name = 'MockApiError';
  }
}

const wait = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
};

const cloneItem = (item: Item): Item => ({
  ...item,
  ...(item.imageUrls ? { imageUrls: [...item.imageUrls] } : {}),
});

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
  await wait();

  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    throw new MockApiError('Page and limit must be positive integers.', 'BAD_REQUEST');
  }

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
  await wait();
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new MockApiError(`Item ${id} was not found.`, 'NOT_FOUND');
  }

  return cloneItem(item);
};

export const createItem = async (itemData: CreateItemInput): Promise<Item> => {
  await wait();
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
  if ((itemData.imageUrls?.length ?? 0) > 5) {
    throw new MockApiError('An item can have at most 5 images.', 'BAD_REQUEST');
  }

  const now = new Date().toISOString();
  const item: Item = {
    ...itemData,
    id: `item-${String(nextItemId++).padStart(3, '0')}`,
    status: 'available',
    createdAt: now,
    updatedAt: now,
  };
  items = [item, ...items];
  notifyItemChanges();
  return cloneItem(item);
};

export const updateItem = async (id: string, itemData: UpdateItemInput): Promise<Item> => {
  await wait();
  const index = items.findIndex((candidate) => candidate.id === id);
  if (index === -1) {
    throw new MockApiError(`Item ${id} was not found.`, 'NOT_FOUND');
  }

  items[index] = {
    ...items[index],
    ...itemData,
    ...(itemData.imageUrls ? { imageUrls: [...itemData.imageUrls] } : {}),
    updatedAt: new Date().toISOString(),
  };
  notifyItemChanges();
  return cloneItem(items[index]);
};

export const deleteItem = async (id: string): Promise<void> => {
  await wait();
  const exists = items.some((item) => item.id === id);
  if (!exists) {
    throw new MockApiError(`Item ${id} was not found.`, 'NOT_FOUND');
  }

  items = items.filter((item) => item.id !== id);
  notifyItemChanges();
};