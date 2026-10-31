/**
 * src/utils/itemFilters.test.ts
 *
 * Kiểm thử đơn vị cho các hàm lọc đồ dùng và chuẩn hóa chuỗi.
 */

import { MOCK_ITEMS } from '../services/api/mockData';
import { filterItems, normalizeText } from './itemFilters';

describe('normalizeText', () => {
  test('xóa khoảng trắng đầu cuối và chuyển về chữ thường', () => {
    expect(normalizeText('  Tai Nghe Bluetooth  ')).toBe('tai nghe bluetooth');
  });

  test('khử dấu tiếng Việt chuẩn xác', () => {
    expect(normalizeText('Giáo trình Lập trình C')).toBe('giao trinh lap trinh c');
    expect(normalizeText('Dụng cụ học tập')).toBe('dung cu hoc tap');
    expect(normalizeText('SÁCH KINH TẾ VI MÔ')).toBe('sach kinh te vi mo');
  });

  test('xử lý ký tự đ và Đ thành d', () => {
    expect(normalizeText('Đồ dùng học tập')).toBe('do dung hoc tap');
    expect(normalizeText('đèn bàn học sinh')).toBe('den ban hoc sinh');
    expect(normalizeText('ĐIỆN THOẠI')).toBe('dien thoai');
  });

  test('trả về chuỗi rỗng khi đầu vào rỗng hoặc null', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });
});

describe('filterItems', () => {
  test('trả về nguyên danh sách khi không có tiêu chí lọc', () => {
    const results = filterItems(MOCK_ITEMS);
    expect(results).toHaveLength(18);
  });

  test('lọc từ khóa CHỈ khớp với tên món (title), không khớp mô tả', () => {
    const descriptionOnlyMatch = filterItems(MOCK_ITEMS, { keyword: 'bluetooth' });
    expect(descriptionOnlyMatch.map((item) => item.id)).not.toContain('item-012');

    const titleMatch = filterItems(MOCK_ITEMS, { keyword: 'quạt' });
    expect(titleMatch.map((item) => item.id)).toContain('item-001');

    const withAccents = filterItems(MOCK_ITEMS, { keyword: 'Giáo trình' });
    const withoutAccents = filterItems(MOCK_ITEMS, { keyword: 'giao trinh' });
    expect(withoutAccents.map((item) => item.id)).toEqual(withAccents.map((item) => item.id));
    expect(withAccents.length).toBeGreaterThan(0);
  });

  test('lọc chính xác theo danh mục', () => {
    const electronics = filterItems(MOCK_ITEMS, { category: 'Thiet bi dien tu' });
    expect(electronics.map((item) => item.id)).toEqual(['item-007', 'item-009', 'item-012', 'item-016', 'item-018']);

    const books = filterItems(MOCK_ITEMS, { category: 'Giao trinh' });
    expect(books.map((item) => item.id)).toEqual(['item-010', 'item-015']);

    const accessories = filterItems(MOCK_ITEMS, { category: 'Phu kien' });
    expect(accessories.map((item) => item.id)).toEqual(['item-011', 'item-013']);

    const supplies = filterItems(MOCK_ITEMS, { category: 'Dung cu hoc tap' });
    expect(supplies.map((item) => item.id)).toEqual(['item-008', 'item-014', 'item-017']);
  });

  test('lọc chính xác theo tình trạng', () => {
    const newItems = filterItems(MOCK_ITEMS, { condition: 'new' });
    expect(newItems.map((item) => item.id)).toEqual(['item-008', 'item-014']);

    const goodItems = filterItems(MOCK_ITEMS, { condition: 'good' });
    expect(goodItems.every((item) => item.condition === 'good')).toBe(true);

    const fairItems = filterItems(MOCK_ITEMS, { condition: 'fair' });
    expect(fairItems.every((item) => item.condition === 'fair')).toBe(true);
  });

  test('lọc chính xác theo người đăng (ownerId)', () => {
    const user1Items = filterItems(MOCK_ITEMS, { ownerId: 'user-001' });
    expect(user1Items).toHaveLength(2);
    expect(user1Items.map((i) => i.id).sort()).toEqual(['item-001', 'item-011']);
  });

  test('kết hợp nhiều tiêu chí bằng phép toán AND', () => {
    // Thiết bị điện tử có tình trạng Mới -> trong 18 món mẫu có 0 món thỏa mãn
    const combo1 = filterItems(MOCK_ITEMS, {
      category: 'Thiet bi dien tu',
      condition: 'new',
    });
    expect(combo1).toHaveLength(0);

    const combo2 = filterItems(MOCK_ITEMS, {
      category: 'Giao trinh',
      condition: 'good',
    });
    expect(combo2.map((item) => item.id)).toEqual(['item-015']);

    const combo3 = filterItems(MOCK_ITEMS, {
      category: 'Dung cu hoc tap',
      condition: 'new',
    });
    expect(combo3.map((item) => item.id)).toEqual(['item-008', 'item-014']);
  });

  test('xử lý danh sách rỗng an toàn', () => {
    const emptyResults = filterItems([], { keyword: 'test' });
    expect(emptyResults).toHaveLength(0);
  });
});
