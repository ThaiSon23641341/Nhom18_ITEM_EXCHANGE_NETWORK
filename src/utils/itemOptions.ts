/**
 * src/utils/itemOptions.ts
 *
 * Danh sách lựa chọn và nhãn hiển thị dùng chung cho đồ dùng trao đổi.
 * Tình trạng: new (Mới), good (Tốt), fair (Khá).
 * Trạng thái: available (Còn), reserved (Đang giữ), exchanged (Đã trao).
 * Thành viên B sẽ dùng lại file này cho ItemForm.
 */

import type { ItemCondition, ItemStatus } from '../models/itemModel';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export const CATEGORY_OPTIONS: FilterOption[] = [
  { value: 'Giao trinh', label: 'Giáo trình' },
  { value: 'Dung cu hoc tap', label: 'Dụng cụ học tập' },
  { value: 'Thiet bi dien tu', label: 'Thiết bị điện tử' },
  { value: 'Phu kien', label: 'Phụ kiện' },
];

export const CONDITION_OPTIONS: FilterOption<ItemCondition>[] = [
  { value: 'new', label: 'Mới' },
  { value: 'good', label: 'Tốt' },
  { value: 'fair', label: 'Khá' },
];

export const STATUS_OPTIONS: FilterOption<ItemStatus>[] = [
  { value: 'available', label: 'Còn' },
  { value: 'reserved', label: 'Đang giữ' },
  { value: 'exchanged', label: 'Đã trao' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  'Giao trinh': 'Giáo trình',
  'Dung cu hoc tap': 'Dụng cụ học tập',
  'Thiet bi dien tu': 'Thiết bị điện tử',
  'Phu kien': 'Phụ kiện',
};

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: 'Mới',
  good: 'Tốt',
  fair: 'Khá',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  available: 'Còn',
  reserved: 'Đang giữ',
  exchanged: 'Đã trao',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function getConditionLabel(condition: ItemCondition): string {
  return CONDITION_LABELS[condition] ?? condition;
}

export function getStatusLabel(status: ItemStatus): string {
  return STATUS_LABELS[status] ?? status;
}
