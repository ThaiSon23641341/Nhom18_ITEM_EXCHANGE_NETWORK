import { useCallback, useEffect, useState } from 'react';
import type {
  ItemReportPaginationResponse,
  ReportResolutionStatus,
} from '../models/reportModel';
import {
  getItemReports,
  ReportServiceError,
  updateItemReportStatus,
} from '../services/api/reportService';

const PAGE_SIZE = 10;

export function useReportModerationController() {
  const [result, setResult] = useState<ItemReportPaginationResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  const loadReports = useCallback(async (pageNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getItemReports(pageNumber, PAGE_SIZE);
      setResult(response);
      setPage(pageNumber);
    } catch (loadError) {
      setError(
        loadError instanceof ReportServiceError
          ? loadError.message
          : 'Không thể tải hàng chờ báo cáo.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports(1);
  }, [loadReports]);

  const resolveReport = useCallback(
    async (reportId: string, status: ReportResolutionStatus) => {
      setUpdatingReportId(reportId);
      setActionError(null);
      try {
        const updatedReport = await updateItemReportStatus(reportId, status);
        setResult((current) =>
          current
            ? {
                ...current,
                data: current.data.map((report) =>
                  report.id === updatedReport.id ? updatedReport : report,
                ),
              }
            : current,
        );
      } catch (updateError) {
        setActionError(
          updateError instanceof ReportServiceError
            ? updateError.message
            : 'Không thể cập nhật trạng thái báo cáo.',
        );
      } finally {
        setUpdatingReportId(null);
      }
    },
    [],
  );

  return {
    result,
    page,
    isLoading,
    error,
    actionError,
    updatingReportId,
    loadReports,
    resolveReport,
  };
}
