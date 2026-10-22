import {
  REPORT_REASONS,
  type CreateItemReportInput,
  type ItemReport,
  type ItemReportPaginationResponse,
  type ReportReason,
  type ReportResolutionStatus,
} from '../../models/reportModel';

export class ReportServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'BAD_REQUEST' | 'NOT_FOUND',
  ) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

let reports: ItemReport[] = [];
let nextReportId = 1;

const cloneReport = (report: ItemReport): ItemReport => ({ ...report });

export const createItemReport = async (
  input: CreateItemReportInput,
): Promise<ItemReport> => {
  const itemId = input.itemId.trim();
  const reporterId = input.reporterId.trim();
  const details = input.details?.trim() ?? '';

  if (!itemId || !reporterId) {
    throw new ReportServiceError(
      'Item and reporter identifiers are required.',
      'BAD_REQUEST',
    );
  }

  if (!isReportReason(input.reason)) {
    throw new ReportServiceError('A valid report reason is required.', 'BAD_REQUEST');
  }

  if (details.length > 500) {
    throw new ReportServiceError(
      'Report details must be 500 characters or fewer.',
      'BAD_REQUEST',
    );
  }

  const report: ItemReport = {
    id: `report-${String(nextReportId).padStart(4, '0')}`,
    itemId,
    reporterId,
    reason: input.reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  nextReportId += 1;
  reports = [report, ...reports];
  return cloneReport(report);
};

export const getItemReports = async (
  page: number,
  limit: number,
): Promise<ItemReportPaginationResponse> => {
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    throw new ReportServiceError(
      'Page and limit must be positive integers.',
      'BAD_REQUEST',
    );
  }

  const total = reports.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    data: reports.slice(start, start + limit).map(cloneReport),
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};

export const updateItemReportStatus = async (
  reportId: string,
  status: ReportResolutionStatus,
): Promise<ItemReport> => {
  const index = reports.findIndex((report) => report.id === reportId);
  if (index === -1) {
    throw new ReportServiceError(`Report ${reportId} was not found.`, 'NOT_FOUND');
  }

  reports[index] = { ...reports[index], status };
  return cloneReport(reports[index]);
};

export const isReportReason = (reason: string): reason is ReportReason =>
  (REPORT_REASONS as readonly string[]).includes(reason);
