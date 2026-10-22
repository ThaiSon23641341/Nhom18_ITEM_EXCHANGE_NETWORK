export const REPORT_REASONS = [
  'prohibited_item',
  'misleading_information',
  'inappropriate_content',
  'suspected_scam',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportStatus = 'pending' | 'actioned' | 'dismissed';
export type ReportResolutionStatus = Exclude<ReportStatus, 'pending'>;

export interface ItemReport {
  id: string;
  itemId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export type CreateItemReportInput = Pick<
  ItemReport,
  'itemId' | 'reporterId' | 'reason'
> & {
  details?: string;
};

export interface ItemReportPaginationResponse {
  data: ItemReport[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
