/**
 * src/utils/itemFilters.ts
 *
 * Hàm chuẩn hóa văn bản và lọc danh sách đồ dùng thuần túy (pure functions).
 * Chỉ so khớp từ khóa với tên món đồ (title), không so với mô tả.
 * Khi Thành viên A nâng cấp service hỗ trợ tìm kiếm/lọc phía server,
 * logic này có thể chuyển thành query params gửi lên API.
 */

import type { Item, ItemCondition } from '../models/itemModel';

export interface ItemFilterCriteria {
  keyword?: string;
  category?: string;
  condition?: ItemCondition | string;
  ownerId?: string;
}

/**
 * Chuẩn hóa chuỗi văn bản:
 * - Bỏ khoảng trắng đầu cuối
 * - Chuyển sang chữ thường
 * - Đổi chữ đ/Đ thành d
 * - Khử dấu tiếng Việt bằng NFD
 */
export function normalizeText(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lọc danh sách món đồ theo các tiêu chí kết hợp bằng AND:
 * - keyword: tìm trong title (sau khi chuẩn hóa)
 * - category: so khớp chính xác mã danh mục
 * - condition: so khớp chính xác tình trạng
 * - ownerId: so khớp chính xác mã người đăng
 */
export function filterItems(items: Item[], criteria?: ItemFilterCriteria): Item[] {
  if (!criteria) {
    return items;
  }

  const normalizedKeyword = criteria.keyword ? normalizeText(criteria.keyword) : '';
  const targetCategory = criteria.category?.trim();
  const targetCondition = criteria.condition?.trim();
  const targetOwnerId = criteria.ownerId?.trim();

  // Không có tiêu chí nào được chỉ định
  if (!normalizedKeyword && !targetCategory && !targetCondition && !targetOwnerId) {
    return items;
  }

  return items.filter((item) => {
    // 1. So khớp từ khóa: CHỈ so với tên món (item.title)
    if (normalizedKeyword) {
      const normalizedTitle = normalizeText(item.title);
      if (!normalizedTitle.includes(normalizedKeyword)) {
        return false;
      }
    }

    // 2. So khớp danh mục
    if (targetCategory && item.category !== targetCategory) {
      return false;
    }

    // 3. So khớp tình trạng
    if (targetCondition && item.condition !== targetCondition) {
      return false;
    }

    // 4. So khớp người sở hữu
    if (targetOwnerId && item.ownerId !== targetOwnerId) {
      return false;
    }

    return true;
  });
}
