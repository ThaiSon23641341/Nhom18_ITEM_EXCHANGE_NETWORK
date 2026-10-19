export type ItemStatus = 'available' | 'reserved' | 'exchanged';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  imageUrl: string;
  status: ItemStatus;
  ownerId: string;
  createdAt: string;
}

export interface ItemPaginationResponse {
  data: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export type CreateItemInput = Omit<Item, 'id' | 'createdAt'>;
export type UpdateItemInput = Partial<CreateItemInput>;