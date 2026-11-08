import AsyncStorage from '@react-native-async-storage/async-storage';

export type ItemViewMode = 'list' | 'grid';

const VIEW_MODE_KEY = 'nhom18.item.viewMode';

export async function loadItemViewMode(): Promise<ItemViewMode> {
  const value = await AsyncStorage.getItem(VIEW_MODE_KEY);
  return value === 'grid' ? 'grid' : 'list';
}

export async function saveItemViewMode(mode: ItemViewMode): Promise<void> {
  await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
}
