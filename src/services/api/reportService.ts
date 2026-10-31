import {
  REPORT_REASONS,
  type CreateItemReportInput,
  type ItemReport,
  type ItemReportPaginationResponse,
  type ReportReason,
  type ReportResolutionStatus,
} from '../../models/reportModel';
import { ApiClientError, apiRequest } from './apiClient';

export class ReportServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'BAD_REQUEST' | 'NOT_FOUND' | 'NETWORK_ERROR',
  ) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

const mapError = (error: unknown): ReportServiceError => {
  if (error instanceof ApiClientError) {
    const code = error.code === 'NOT_FOUND'
      ? 'NOT_FOUND'
      : error.code === 'NETWORK_ERROR'
        ? 'NETWORK_ERROR'
        : 'BAD_REQUEST';
    return new ReportServiceError(error.message, code);
  }
  if (error instanceof Error) return new ReportServiceError(error.message, 'BAD_REQUEST');
  return new ReportServiceError('Yêu cầu báo cáo không thành công.', 'BAD_REQUEST');
};

const createId = (): string =>
  `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const isReportReason = (reason: string): reason is ReportReason =>
  (REPORT_REASONS as readonly string[]).includes(reason);

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

  try {
    return await apiRequest<ItemReport>('/reports', {
      method: 'POST',
      body: JSON.stringify({
        id: createId(),
        itemId,
        reporterId,
        reason: input.reason,
        details,
      }),
    });
  } catch (error) {
    throw mapError(error);
  }
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

  try {
    const reports = await apiRequest<ItemReport[]>('/reports?_sort=createdAt&_order=desc');
    const total = reports.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return {
      data: reports.slice(start, start + limit).map((report) => ({ ...report })),
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    throw mapError(error);
  }
};

export const updateItemReportStatus = async (
  reportId: string,
  status: ReportResolutionStatus,
): Promise<ItemReport> => {
  if (!reportId.trim() || !['actioned', 'dismissed'].includes(status)) {
    throw new ReportServiceError('A valid report status is required.', 'BAD_REQUEST');
  }
  try {
    return await apiRequest<ItemReport>(`/reports/${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    throw mapError(error);
  }
};
