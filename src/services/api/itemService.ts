import { CreateItemInput, Item, ItemPaginationResponse, UpdateItemInput } from '../../models';
import { MOCK_ITEMS } from './mockData';

const API_DELAY_MS = 500;
let items = MOCK_ITEMS.map((item) => ({ ...item }));

export class MockApiError extends Error {
  constructor(message: string, public readonly code: 'BAD_REQUEST' | 'NOT_FOUND') {
    super(message);
    this.name = 'MockApiError';
  }
}

const wait = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
};

const cloneItem = (item: Item): Item => ({ ...item });

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
  if (!itemData.title.trim() || !itemData.ownerId.trim()) {
    throw new MockApiError('Title and ownerId are required.', 'BAD_REQUEST');
  }

  const item: Item = {
    ...itemData,
    id: `item-${String(items.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  items = [item, ...items];
  return cloneItem(item);
};

export const updateItem = async (id: string, itemData: UpdateItemInput): Promise<Item> => {
  await wait();
  const index = items.findIndex((candidate) => candidate.id === id);
  if (index === -1) {
    throw new MockApiError(`Item ${id} was not found.`, 'NOT_FOUND');
  }

  items[index] = { ...items[index], ...itemData };
  return cloneItem(items[index]);
};

export const deleteItem = async (id: string): Promise<void> => {
  await wait();
  const exists = items.some((item) => item.id === id);
  if (!exists) {
    throw new MockApiError(`Item ${id} was not found.`, 'NOT_FOUND');
  }

  items = items.filter((item) => item.id !== id);
};