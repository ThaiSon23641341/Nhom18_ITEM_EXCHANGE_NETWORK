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
    // 'Tai nghe Bluetooth' có tên chứa Bluetooth
    // 'Chuot khong day' chỉ có MÔ TẢ chứa Bluetooth chứ tên không chứa
    const results = filterItems(MOCK_ITEMS, { keyword: 'bluetooth' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Tai nghe Bluetooth');

    // Tìm 'giao trinh' có dấu hoặc không dấu đều khớp 4 món
    const withAccents = filterItems(MOCK_ITEMS, { keyword: 'Giáo trình' });
    const withoutAccents = filterItems(MOCK_ITEMS, { keyword: 'giao trinh' });
    expect(withAccents).toHaveLength(4);
    expect(withoutAccents).toHaveLength(4);
  });

  test('lọc chính xác theo danh mục', () => {
    const electronics = filterItems(MOCK_ITEMS, { category: 'Thiet bi dien tu' });
    expect(electronics).toHaveLength(7);

    const books = filterItems(MOCK_ITEMS, { category: 'Giao trinh' });
    expect(books).toHaveLength(4);

    const accessories = filterItems(MOCK_ITEMS, { category: 'Phu kien' });
    expect(accessories).toHaveLength(2);

    const supplies = filterItems(MOCK_ITEMS, { category: 'Dung cu hoc tap' });
    expect(supplies).toHaveLength(5);
  });

  test('lọc chính xác theo tình trạng', () => {
    const newItems = filterItems(MOCK_ITEMS, { condition: 'new' });
    expect(newItems).toHaveLength(3);

    const goodItems = filterItems(MOCK_ITEMS, { condition: 'good' });
    expect(goodItems).toHaveLength(10);

    const fairItems = filterItems(MOCK_ITEMS, { condition: 'fair' });
    expect(fairItems).toHaveLength(5);
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

    // Giao trình có tình trạng good -> có 3 món (item-001, item-005, item-015)
    const combo2 = filterItems(MOCK_ITEMS, {
      category: 'Giao trinh',
      condition: 'good',
    });
    expect(combo2).toHaveLength(3);

    // Dụng cụ học tập + new -> 3 món (item-004, item-008, item-014)
    const combo3 = filterItems(MOCK_ITEMS, {
      category: 'Dung cu hoc tap',
      condition: 'new',
    });
    expect(combo3).toHaveLength(3);
  });

  test('xử lý danh sách rỗng an toàn', () => {
    const emptyResults = filterItems([], { keyword: 'test' });
    expect(emptyResults).toHaveLength(0);
  });
});
