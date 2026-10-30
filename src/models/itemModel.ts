export type ItemStatus = 'available' | 'reserved' | 'exchanged';
export type ItemCondition = 'new' | 'good' | 'fair';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  imageUrl: string;
  imageUrls?: string[];
  status: ItemStatus;
  ownerId: string;
  priceVnd?: number;
  location?: string;
  distance?: string;
  ownerName?: string;
  ownerFaculty?: string;
  ownerAvatarUrl?: string;
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
> &
  Partial<
    Pick<
      Item,
      | 'imageUrls'
      | 'priceVnd'
      | 'location'
      | 'distance'
      | 'ownerName'
      | 'ownerFaculty'
      | 'ownerAvatarUrl'
    >
  >;
export type UpdateItemInput = Partial<
  Pick<
    Item,
    | 'title'
    | 'description'
    | 'category'
    | 'condition'
    | 'imageUrl'
    | 'imageUrls'
    | 'priceVnd'
    | 'location'
    | 'status'
  >
>;