import {
  addFavorite,
  FavoriteServiceError,
  getFavorites,
  removeFavorite,
} from './favoriteService';

const mockJsonResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as Response;

describe('favoriteService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('gets favorites for an encoded user ID', async () => {
    const favorites = [{
      id: 'favorite-001',
      userId: 'user one',
      itemId: 'item-001',
      createdAt: '2026-11-05T00:00:00.000Z',
    }];
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse(favorites),
    );

    await expect(getFavorites('user one')).resolves.toEqual(favorites);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/favorites\?userId=user%20one$/),
      expect.any(Object),
    );
  });

  test('adds and removes a favorite through the API', async () => {
    const favorite = {
      id: 'favorite-001',
      userId: 'user-001',
      itemId: 'item-001',
      createdAt: '2026-11-05T00:00:00.000Z',
    };
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse(favorite, 201))
      .mockResolvedValueOnce(mockJsonResponse(favorite));

    await expect(addFavorite('user-001', 'item-001')).resolves.toEqual(favorite);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      userId: 'user-001',
      itemId: 'item-001',
    });

    await expect(removeFavorite(favorite.id)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/favorites\/favorite-001$/),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  test('rejects empty identifiers and maps duplicate errors', async () => {
    await expect(getFavorites(' ')).rejects.toBeInstanceOf(FavoriteServiceError);
    await expect(addFavorite('user-001', '')).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({
        error: { code: 'CONFLICT', message: 'Already favorited.' },
      }, 409),
    );
    await expect(addFavorite('user-001', 'item-001')).rejects.toMatchObject({
      name: 'FavoriteServiceError',
      code: 'CONFLICT',
    });
  });
});
