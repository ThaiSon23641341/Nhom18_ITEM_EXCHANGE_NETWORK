import { router } from 'expo-router';
import { goBackOrReplace } from './navigation';

jest.mock('expo-router', () => ({
  router: {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('goBackOrReplace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('goes back when the navigator has history', () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);

    goBackOrReplace('/(tabs)');

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('uses the fallback route when the current screen has no history', () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrReplace('/(tabs)');

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
