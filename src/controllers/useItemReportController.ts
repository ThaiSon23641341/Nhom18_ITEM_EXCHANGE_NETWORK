import { useCallback, useEffect, useState } from 'react';
import type { Item } from '../models/itemModel';
import { type ReportReason } from '../models/reportModel';
import { createItemReport, ReportServiceError } from '../services/api/reportService';
import { getItemById, MockApiError } from '../services/api/itemService';
import { MOCK_USER } from '../utils/constants';

export function useItemReportController(itemId: string | undefined) {
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // The effect resets the form whenever the route item changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setLoadError(null);
    setItem(null);
    setSubmitted(false);
    setSelectedReason(null);
    setDetails('');
    setSubmitError(null);

    if (!itemId) {
      setLoadError('Không tìm thấy mã bài đăng cần báo cáo.');
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    getItemById(itemId)
      .then((loadedItem) => {
        if (isActive) setItem(loadedItem);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          error instanceof MockApiError
            ? error.message
            : 'Không thể tải bài đăng. Vui lòng thử lại.',
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [itemId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setReason = useCallback((nextReason: ReportReason) => {
    setSelectedReason(nextReason);
    setSubmitError(null);
  }, []);

  const submitReport = useCallback(async () => {
    if (!itemId || !reason) {
      setSubmitError('Vui lòng chọn lý do báo cáo.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createItemReport({
        itemId,
        reporterId: MOCK_USER.id,
        reason,
        details,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof ReportServiceError
          ? error.message
          : 'Không thể gửi báo cáo. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [details, itemId, reason]);

  return {
    item,
    isLoading,
    loadError,
    reason,
    setReason,
    details,
    setDetails,
    isSubmitting,
    submitError,
    submitted,
    submitReport,
  };
}
