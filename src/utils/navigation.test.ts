import { router } from 'expo-router';
import { goBackOrReplace } from './navigation';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('goBackOrReplace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('goes back when navigation history exists', () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);

    goBackOrReplace('/(tabs)');

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('replaces the current route when there is no navigation history', () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrReplace('/(tabs)');

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
