import {
  createItemReport,
  getItemReports,
  ReportServiceError,
  updateItemReportStatus,
} from './reportService';

const mockJsonResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as Response;

const makeReport = (suffix: string) => ({
  itemId: `item-${suffix}`,
  reporterId: `user-${suffix}`,
  reason: 'suspected_scam' as const,
});

describe('reportService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('creates a report through JSON Server', async () => {
    const report = {
      id: 'report-created',
      itemId: 'item-create',
      reporterId: 'user-create',
      reason: 'suspected_scam' as const,
      details: '',
      status: 'pending' as const,
      createdAt: '2026-10-31T00:00:00.000Z',
      updatedAt: '2026-10-31T00:00:00.000Z',
    };
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(report, 201));

    await expect(createItemReport(makeReport('create'))).resolves.toMatchObject(report);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/reports$/),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  test('trims IDs and report details before sending', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ itemId: 'item-trim', reporterId: 'user-trim', details: 'Review this' }),
    );

    await createItemReport({
      ...makeReport('trim'),
      itemId: ' item-trim ',
      reporterId: ' user-trim ',
      details: '  Review this  ',
    });
    const [, options] = jest.mocked(globalThis.fetch).mock.calls[0];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      itemId: 'item-trim',
      reporterId: 'user-trim',
      details: 'Review this',
    });
  });

  test.each([
    { ...makeReport('missing-item'), itemId: '  ' },
    { ...makeReport('missing-user'), reporterId: '' },
    { ...makeReport('bad-reason'), reason: 'unsupported' as 'suspected_scam' },
    { ...makeReport('long-details'), details: 'a'.repeat(501) },
  ])('rejects invalid report input', async (input) => {
    await expect(createItemReport(input)).rejects.toBeInstanceOf(ReportServiceError);
  });

  test('returns paginated reports and updates report status', async () => {
    const reports = [0, 1, 2].map((index) => ({
      id: `report-${index}`,
      itemId: 'item-001',
      reporterId: 'user-001',
      reason: 'other' as const,
      details: '',
      status: 'pending' as const,
      createdAt: `2026-10-0${index + 1}T00:00:00.000Z`,
      updatedAt: `2026-10-0${index + 1}T00:00:00.000Z`,
    }));
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse(reports))
      .mockResolvedValueOnce(mockJsonResponse({ ...reports[0], status: 'actioned' }));

    await expect(getItemReports(2, 2)).resolves.toMatchObject({
      data: [reports[2]],
      page: 2,
      total: 3,
      hasMore: false,
    });
    await expect(updateItemReportStatus('report-0', 'actioned')).resolves.toMatchObject({
      status: 'actioned',
    });
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/reports\/report-0$/),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  test('rejects invalid pagination and reports missing records', async () => {
    await expect(getItemReports(0, 10)).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ error: { code: 'NOT_FOUND', message: 'Report not found.' } }, 404),
    );
    await expect(updateItemReportStatus('missing', 'dismissed')).rejects.toMatchObject({
      name: 'ReportServiceError',
      code: 'NOT_FOUND',
    });
  });
});
