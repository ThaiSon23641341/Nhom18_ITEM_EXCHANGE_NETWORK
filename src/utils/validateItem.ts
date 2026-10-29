import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from './itemOptions';
import type { ItemCondition } from '../models/itemModel';

export interface ItemFormValues {
  title: string;
  description: string;
  category: string;
  condition: ItemCondition | '';
  imageUrl: string;
}

export type ItemFormErrors = Partial<Record<keyof ItemFormValues, string>>;

export function validateItemForm(values: ItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) errors.title = 'Vui lòng nhập tên món đồ.';
  else if (title.length < 3 || title.length > 100) errors.title = 'Tên món đồ phải từ 3 đến 100 ký tự.';

  if (!description) errors.description = 'Vui lòng nhập mô tả.';
  else if (description.length < 10 || description.length > 1000) errors.description = 'Mô tả phải từ 10 đến 1000 ký tự.';

  if (!values.category) errors.category = 'Vui lòng chọn danh mục.';
  else if (!CATEGORY_OPTIONS.some((option) => option.value === values.category)) errors.category = 'Danh mục không hợp lệ.';

  if (!values.condition) errors.condition = 'Vui lòng chọn tình trạng.';
  else if (!CONDITION_OPTIONS.some((option) => option.value === values.condition)) errors.condition = 'Tình trạng không hợp lệ.';

  if (values.imageUrl.length > 2048) errors.imageUrl = 'Đường dẫn ảnh không được vượt quá 2048 ký tự.';

  return errors;
}
