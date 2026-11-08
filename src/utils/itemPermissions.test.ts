import type { Item } from '../models/itemModel';
import { canDeleteItem, canEditItem } from './itemPermissions';

const makeItem = (status: Item['status'], ownerId = 'user-001'): Item => ({
  id: 'item-001',
  title: 'Món kiểm thử',
  description: 'Mô tả kiểm thử',
  category: 'Sách',
  condition: 'good',
  imageUrl: '',
  status,
  ownerId,
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
});

describe('itemPermissions', () => {
  test('cho phép chủ sở hữu sửa/xóa available', () => {
    expect(canEditItem(makeItem('available'), 'user-001')).toBe(true);
    expect(canDeleteItem(makeItem('available'), 'user-001')).toBe(true);
  });

  test('chặn người khác và món đã trao', () => {
    expect(canEditItem(makeItem('available', 'user-002'), 'user-001')).toBe(false);
    expect(canDeleteItem(makeItem('exchanged'), 'user-001')).toBe(false);
    expect(canEditItem(makeItem('exchanged'), 'user-001')).toBe(false);
    expect(canDeleteItem(makeItem('reserved'), 'user-001')).toBe(true);
  });
});
