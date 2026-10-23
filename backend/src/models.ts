export type ItemStatus = 'available' | 'reserved' | 'exchanged';
export type ItemCondition = 'new' | 'good' | 'fair';
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';
export type ReportStatus = 'pending' | 'actioned' | 'dismissed';
export const REPORT_REASONS = [
  'prohibited_item',
  'misleading_information',
  'inappropriate_content',
  'suspected_scam',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export interface User {
  id: string;
  email: string;
  studentId: string;
  fullName: string;
  avatarUrl: string;
  phoneNumber?: string;
  role: 'student' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Pick<User, 'id' | 'fullName' | 'avatarUrl'>;

export interface Item {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  imageUrl: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateItemInput = Pick<
  Item,
  | 'ownerId'
  | 'title'
  | 'description'
  | 'category'
  | 'condition'
  | 'imageUrl'
>;
export type UpdateItemInput = Partial<
  Pick<
    Item,
    | 'title'
    | 'description'
    | 'category'
    | 'condition'
    | 'imageUrl'
    | 'status'
  >
>;

export interface Appointment {
  id: string;
  itemId: string;
  requesterId: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateAppointmentInput = Pick<
  Appointment,
  'itemId' | 'requesterId' | 'date' | 'time' | 'location'
>;

export interface ItemReport {
  id: string;
  itemId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateItemReportInput = Pick<
  ItemReport,
  'itemId' | 'reporterId' | 'reason'
> & {
  details?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
