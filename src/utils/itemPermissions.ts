import type { Item } from '../models/itemModel';

export function canEditItem(item: Item | null | undefined): boolean {
  return Boolean(item && item.status !== 'exchanged');
}

export function canDeleteItem(item: Item | null | undefined): boolean {
  return Boolean(item && item.status !== 'exchanged');
}
