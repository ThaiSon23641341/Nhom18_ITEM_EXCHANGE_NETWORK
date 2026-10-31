import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from './itemOptions';
import type { ItemCondition } from '../models/itemModel';

export interface ItemFormValues {
  title: string;
  description: string;
  category: string;
  condition: ItemCondition | '';
  imageUrl: string;
  imageUrls: string[];
  price: string;
  location: string;
}

export type ItemFormErrors = Partial<Record<keyof ItemFormValues, string>>;

export function validateItemForm(values: ItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) errors.title = 'Vui lòng nhập tên món đồ.';
  else if (title.length < 3 || title.length > 120) errors.title = 'Tên món đồ phải từ 3 đến 120 ký tự.';

  if (!description) errors.description = 'Vui lòng nhập mô tả.';
  else if (description.length < 10 || description.length > 2000) errors.description = 'Mô tả phải từ 10 đến 2000 ký tự.';

  if (!values.category) errors.category = 'Vui lòng chọn danh mục.';
  else if (!CATEGORY_OPTIONS.some((option) => option.value === values.category)) errors.category = 'Danh mục không hợp lệ.';

  if (!values.condition) errors.condition = 'Vui lòng chọn tình trạng.';
  else if (!CONDITION_OPTIONS.some((option) => option.value === values.condition)) errors.condition = 'Tình trạng không hợp lệ.';

  if (values.imageUrls.length > 5) errors.imageUrls = 'Bạn chỉ có thể chọn tối đa 5 ảnh.';
  else if (values.imageUrls.some((uri) => uri.length > 2048)) {
    errors.imageUrls = 'Đường dẫn ảnh không được vượt quá 2048 ký tự.';
  }

  const price = values.price.trim();
  if (price && (!/^\d+$/.test(price) || !Number.isSafeInteger(Number(price)))) {
    errors.price = 'Giá tiền phải là số nguyên không âm hợp lệ.';
  }

  if (values.location.trim().length > 200) {
    errors.location = 'Địa điểm giao dịch không được vượt quá 200 ký tự.';
  }

  return errors;
}
