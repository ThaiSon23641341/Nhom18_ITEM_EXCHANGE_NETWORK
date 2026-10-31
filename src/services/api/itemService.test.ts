import {
  createItem,
  getItemById,
  getItems,
  MockApiError,
  subscribeToItemChanges,
  updateItem,
} from './itemService';

const mockJsonResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as Response;

describe('itemService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('loads and paginates items from JSON Server', async () => {
    const items = Array.from({ length: 3 }, (_, index) => ({
      id: `item-${index + 1}`,
      title: `Item ${index + 1}`,
      description: 'Test listing',
      category: 'Books',
      condition: 'good' as const,
      imageUrl: '',
      status: 'available' as const,
      ownerId: 'user-001',
      createdAt: `2026-10-0${index + 1}T00:00:00.000Z`,
      updatedAt: `2026-10-0${index + 1}T00:00:00.000Z`,
    }));
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(items));

    await expect(getItems(2, 2)).resolves.toMatchObject({
      data: [items[2]],
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasMore: false,
    });
  });

  test('creates an item through JSON Server and notifies subscribers', async () => {
    const created = {
      id: 'item-created',
      title: 'Áo khoác kiểm thử',
      description: 'Áo còn mới, phù hợp sinh viên.',
      category: 'Thời trang',
      condition: 'good' as const,
      imageUrl: 'file://coat.jpg',
      imageUrls: ['file://coat.jpg', 'file://coat-back.jpg'],
      status: 'available' as const,
      ownerId: 'student-12345678',
      priceVnd: 120000,
      location: 'Thư viện IUH',
      createdAt: '2026-10-31T00:00:00.000Z',
      updatedAt: '2026-10-31T00:00:00.000Z',
    };
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(created, 201));
    const listener = jest.fn();
    const unsubscribe = subscribeToItemChanges(listener);

    await expect(createItem({
      title: created.title,
      description: created.description,
      category: created.category,
      condition: created.condition,
      imageUrl: created.imageUrl,
      imageUrls: created.imageUrls,
      ownerId: created.ownerId,
      ownerName: 'Sinh viên kiểm thử',
      priceVnd: created.priceVnd,
      location: created.location,
    })).resolves.toMatchObject(created);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/items$/),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test('retrieves and updates item details over HTTP', async () => {
    const item = {
      id: 'item-001',
      title: 'Giáo trình',
      description: 'Sách còn tốt',
      category: 'Sách',
      condition: 'good' as const,
      imageUrl: '',
      status: 'available' as const,
      ownerId: 'user-001',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse(item))
      .mockResolvedValueOnce(mockJsonResponse({ ...item, title: 'Sách mới' }));

    await expect(getItemById('item-001')).resolves.toMatchObject(item);
    await expect(updateItem('item-001', { title: 'Sách mới' })).resolves.toMatchObject({
      title: 'Sách mới',
    });
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/items\/item-001$/),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  test('rejects invalid listing data before making a request', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');

    await expect(createItem({
      title: '   ',
      description: '',
      category: '',
      condition: 'good',
      imageUrl: '',
      ownerId: 'student-12345678',
    })).rejects.toMatchObject<Partial<MockApiError>>({
      code: 'BAD_REQUEST',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  test('surfaces server errors as service errors', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ error: { code: 'NOT_FOUND', message: 'Item not found.' } }, 404),
    );

    await expect(getItemById('missing')).rejects.toMatchObject({
      name: 'MockApiError',
      code: 'NOT_FOUND',
      message: 'Item not found.',
    });
  });
});
