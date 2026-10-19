# DỰ ÁN REACT NATIVE - BỘ QUY CHUẨN MÃ NGUỒN (CODING STANDARDS & CONVENTIONS)

Tài liệu này bắt buộc áp dụng đối với tất cả AI Agents và thành viên trong nhóm nhằm bảo đảm tính đồng nhất, sạch sẽ và tuân thủ các CLO môn học.

---

## 1. QUY ƯỚC ĐẶT TÊN (NAMING CONVENTIONS)

| Đối tượng | Quy tắc đặt tên | Ví dụ |
| :--- | :--- | :--- |
| **Files & Directories (UI/Views)** | PascalCase | `ItemCard.tsx`, `HomeScreen.tsx` |
| **Files (Controllers/Hooks)** | camelCase (bắt đầu bằng `use`) | `useItemController.ts`, `useAuthController.ts` |
| **Files (Models/Services/Utils)** | camelCase | `itemModel.ts`, `apiService.ts` |
| **Components & Interfaces** | PascalCase | `function ItemCard()`, `interface UserProfile` |
| **Functions & Variables** | camelCase | `fetchProductList()`, `isLoading` |
| **Constants & Environment Variables**| UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_PAGE_SIZE` |
| **Types / Enums** | PascalCase | `type ItemStatus = 'active' | 'sold';` |

---

## 2. QUY CHUẨN KIẾN TRÚC MVC VÀ TÁCH CÁC TẦNG

### A. Model (`src/models/itemModel.ts`)
```typescript
export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface ItemPaginationResponse {
  data: Item[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}