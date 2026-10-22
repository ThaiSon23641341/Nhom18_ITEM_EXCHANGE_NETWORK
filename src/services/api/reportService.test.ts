import {
  createItemReport,
  getItemReports,
  ReportServiceError,
  updateItemReportStatus,
} from './reportService';

const makeReport = (suffix: string) => ({
  itemId: `item-${suffix}`,
  reporterId: `user-${suffix}`,
  reason: 'suspected_scam' as const,
});

describe('reportService', () => {
  test('creates a pending report', async () => {
    const result = await createItemReport(makeReport('create'));

    expect(result).toMatchObject({
      itemId: 'item-create',
      reporterId: 'user-create',
      reason: 'suspected_scam',
      status: 'pending',
    });
    expect(result.id).toMatch(/^report-\d{4}$/);
    expect(Number.isNaN(Date.parse(result.createdAt))).toBe(false);
  });

  test('trims identifiers and report details', async () => {
    const result = await createItemReport({
      ...makeReport('trim'),
      itemId: ' item-trim ',
      reporterId: ' user-trim ',
      details: '  Please review this listing.  ',
    });

    expect(result).toMatchObject({
      itemId: 'item-trim',
      reporterId: 'user-trim',
      details: 'Please review this listing.',
    });
  });

  test('uses an empty details string when none is provided', async () => {
    const result = await createItemReport(makeReport('empty-details'));

    expect(result.details).toBe('');
  });

  test('rejects a missing item identifier', async () => {
    await expect(
      createItemReport({ ...makeReport('missing-item'), itemId: '  ' }),
    ).rejects.toMatchObject({
      name: 'ReportServiceError',
      code: 'BAD_REQUEST',
    });
  });

  test('rejects a missing reporter identifier', async () => {
    await expect(
      createItemReport({ ...makeReport('missing-user'), reporterId: '' }),
    ).rejects.toMatchObject({
      name: 'ReportServiceError',
      code: 'BAD_REQUEST',
    });
  });

  test('rejects an unsupported report reason', async () => {
    await expect(
      createItemReport({
        ...makeReport('invalid-reason'),
        reason: 'unsupported' as 'suspected_scam',
      }),
    ).rejects.toBeInstanceOf(ReportServiceError);
  });

  test('rejects details longer than 500 characters', async () => {
    await expect(
      createItemReport({ ...makeReport('long-details'), details: 'a'.repeat(501) }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  test('returns paginated reports with stable metadata', async () => {
    const before = await getItemReports(1, 1000);
    await createItemReport(makeReport('page-one'));
    await createItemReport(makeReport('page-two'));

    const firstPage = await getItemReports(1, 1);

    expect(firstPage.total).toBe(before.total + 2);
    expect(firstPage.data).toHaveLength(1);
    expect(firstPage.page).toBe(1);
    expect(firstPage.hasMore).toBe(true);
  });

  test('rejects invalid pagination parameters', async () => {
    await expect(getItemReports(0, 10)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    await expect(getItemReports(1, 0)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  test('updates a report to an actioned status', async () => {
    const created = await createItemReport(makeReport('resolve'));
    const updated = await updateItemReportStatus(created.id, 'actioned');

    expect(updated.status).toBe('actioned');
  });

  test('returns a not-found error when resolving an unknown report', async () => {
    await expect(
      updateItemReportStatus('report-missing', 'dismissed'),
    ).rejects.toMatchObject({
      name: 'ReportServiceError',
      code: 'NOT_FOUND',
    });
  });
});
