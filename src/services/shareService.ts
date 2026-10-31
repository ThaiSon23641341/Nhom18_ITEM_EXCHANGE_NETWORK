import { Alert, Platform, Share } from 'react-native';
import * as Linking from 'expo-linking';

export function createItemShareUrl(itemId: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/item/${encodeURIComponent(itemId)}`;
  }

  return Linking.createURL(`/item/${encodeURIComponent(itemId)}`);
}

export async function shareItem(itemId: string, itemTitle?: string): Promise<void> {
  const url = createItemShareUrl(itemId);

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: itemTitle ?? 'Chia sẻ món đồ',
        text: itemTitle ?? 'Món đồ trao đổi',
        url,
      });
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      Alert.alert('Đã sao chép', 'Đường dẫn món đồ đã được sao chép vào clipboard.');
      return;
    }

    throw new Error('Trình duyệt không hỗ trợ chia sẻ hoặc sao chép đường dẫn.');
  }

  await Share.share({
    title: itemTitle ?? 'Chia sẻ món đồ',
    message: `${itemTitle ?? 'Món đồ trao đổi'}\n${url}`,
    url,
  });
}
