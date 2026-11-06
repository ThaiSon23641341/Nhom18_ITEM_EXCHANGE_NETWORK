import type { Item } from '../models/itemModel';

export function canEditItem(item: Item, userId?: string): boolean {
  return Boolean(userId && item.ownerId === userId && item.status !== 'exchanged');
}

export function canDeleteItem(item: Item, userId?: string): boolean {
  return Boolean(userId && item.ownerId === userId && item.status !== 'exchanged');
}
