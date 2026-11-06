import { parseItemDeepLink } from '../utils/deepLink';

describe('parseItemDeepLink', () => {
  it('parses a custom item deep link', () => {
    expect(parseItemDeepLink('nhom18item://item/item-001')).toEqual({
      itemId: 'item-001',
    });
  });

  it('parses an encoded item id', () => {
    expect(parseItemDeepLink('https://example.test/item/item%2F001')).toEqual({
      itemId: 'item/001',
    });
  });

  it('supports Expo web deep-link paths', () => {
    expect(parseItemDeepLink('http://localhost:8081/--/item/item-002')).toEqual({
      itemId: 'item-002',
    });
  });

  it.each([
    undefined,
    '',
    'nhom18item://appointments/appointment-001',
    'nhom18item://item/',
    'nhom18item://item/item-001/extra',
  ])('ignores unsupported URL %p', (url) => {
    expect(parseItemDeepLink(url)).toBeNull();
  });
});
