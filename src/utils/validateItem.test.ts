import { validateItemForm, type ItemFormValues } from './validateItem';

const valid: ItemFormValues = {
  title: 'Sách',
  description: 'Mô tả đầy đủ món đồ dùng',
  category: 'Giao trinh',
  condition: 'new',
  imageUrl: '',
  imageUrls: [],
  price: '',
  location: 'Sảnh thư viện IUH',
};

describe('validateItemForm', () => {
  test('báo lỗi khi để trống', () => {
    const errors = validateItemForm({
      title: '',
      description: '',
      category: '',
      condition: '',
      imageUrl: '',
      imageUrls: [],
      price: '',
      location: '',
    });
    expect(errors.title).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.category).toBeTruthy();
    expect(errors.condition).toBeTruthy();
  });

  test('kiểm tra các ngưỡng tên và mô tả', () => {
    expect(validateItemForm({ ...valid, title: 'ab' }).title).toBeTruthy();
    expect(validateItemForm({ ...valid, title: 'abc' }).title).toBeUndefined();
    expect(validateItemForm({ ...valid, title: 'a'.repeat(121) }).title).toBeTruthy();
    expect(validateItemForm({ ...valid, title: 'a'.repeat(120) }).title).toBeUndefined();
    expect(validateItemForm({ ...valid, description: '123456789' }).description).toBeTruthy();
    expect(validateItemForm({ ...valid, description: '1234567890' }).description).toBeUndefined();
    expect(validateItemForm({ ...valid, description: 'a'.repeat(2001) }).description).toBeTruthy();
    expect(validateItemForm({ ...valid, description: 'a'.repeat(2000) }).description).toBeUndefined();
  });

  test('kiểm tra danh mục, tình trạng và khoảng trắng', () => {
    expect(validateItemForm({ ...valid, category: 'invalid' }).category).toBeTruthy();
    expect(validateItemForm({ ...valid, condition: 'bad' as ItemFormValues['condition'] }).condition).toBeTruthy();
    expect(validateItemForm({ ...valid, title: '  abc  ' }).title).toBeUndefined();
    expect(validateItemForm({ ...valid, imageUrls: ['a'.repeat(2049)] }).imageUrls).toBeTruthy();
  });

  test('kiểm tra giá và giới hạn ảnh', () => {
    expect(validateItemForm({ ...valid, price: '-1' }).price).toBeTruthy();
    expect(validateItemForm({ ...valid, price: '12.5' }).price).toBeTruthy();
    expect(validateItemForm({ ...valid, price: '0' }).price).toBeUndefined();
    expect(validateItemForm({ ...valid, imageUrls: Array(6).fill('image://item') }).imageUrls).toBeTruthy();
  });
});
