import type { Item } from '../models/itemModel';
import { canDeleteItem, canEditItem } from './itemPermissions';

const item = (status: Item['status']): Item => ({
  id: 'item-001',
  title: 'Giáo trình',
  description: 'Mô tả chi tiết món đồ',
  category: 'Giao trinh',
  condition: 'good',
  imageUrl: '',
  status,
  ownerId: 'user-001',
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
});

describe('itemPermissions', () => {
  test('cho phép sửa hoặc xóa món đang có sẵn hoặc đang giữ', () => {
    expect(canEditItem(item('available'))).toBe(true);
    expect(canDeleteItem(item('reserved'))).toBe(true);
  });

  test('chặn sửa hoặc xóa món đã trao', () => {
    expect(canEditItem(item('exchanged'))).toBe(false);
    expect(canDeleteItem(item('exchanged'))).toBe(false);
  });
});
