import { createItem, getItemById, MockApiError } from './itemService';

describe('itemService', () => {
  test('creates an item that can be retrieved with its submitted data', async () => {
    const created = await createItem({
      title: 'Áo khoác kiểm thử',
      description: 'Áo còn mới, phù hợp sinh viên.',
      category: 'Thời trang',
      condition: 'good',
      imageUrl: 'file://coat.jpg',
      imageUrls: ['file://coat.jpg', 'file://coat-back.jpg'],
      ownerId: 'student-12345678',
      ownerName: 'Sinh viên kiểm thử',
      priceVnd: 120000,
      location: 'Thư viện IUH',
    });

    await expect(getItemById(created.id)).resolves.toMatchObject({
      ...created,
      status: 'available',
      imageUrls: ['file://coat.jpg', 'file://coat-back.jpg'],
    });
  });

  test('rejects invalid listing data instead of accepting an incomplete post', async () => {
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
  });
});
