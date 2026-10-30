export type ItemStatus = 'available' | 'reserved' | 'exchanged';
export type ItemCondition = 'new' | 'good' | 'fair';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  imageUrl: string;
  status: ItemStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemPaginationResponse {
  data: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export type CreateItemInput = Pick<
  Item,
  'title' | 'description' | 'category' | 'condition' | 'imageUrl' | 'ownerId'
>;
export type UpdateItemInput = Partial<
  Pick<
    Item,
    'title' | 'description' | 'category' | 'condition' | 'imageUrl' | 'status'
  >
>;