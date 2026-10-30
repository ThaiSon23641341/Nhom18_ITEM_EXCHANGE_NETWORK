import { Link, router, useLocalSearchParams, type RelativePathString } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator, Text, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { getItemById } from '../../services/api/itemService';
import { shareItem } from '../../services/shareService';
import { useAuthController } from '../../controllers/useAuthController';
import { CustomButton } from '../components/CustomButton';

export function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuthController();

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      return () => {
        isMounted = false;
      };
    }

    // The effect synchronizes the screen with the item API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setErrorMessage(null);
    getItemById(id)
      .then((loadedItem) => {
        if (isMounted) setItem(loadedItem);
      })
      .catch(() => {
        if (isMounted) setErrorMessage('Không thể tải thông tin món đồ. Vui lòng thử lại.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
        <Text color="color" text="center">Không tìm thấy mã món đồ.</Text>
        <CustomButton onPress={() => router.back()}>Quay lại</CustomButton>
      </YStack>
    );
  }

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" gap="3">
        <ActivityIndicator />
        <Text color="color">Đang tải thông tin món đồ...</Text>
      </YStack>
    );
  }

  if (!item || errorMessage) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="6" gap="4">
        <Text color="color" text="center">{errorMessage ?? 'Không tìm thấy món đồ.'}</Text>
        <CustomButton onPress={() => router.back()}>Quay lại</CustomButton>
      </YStack>
    );
  }

  const isAvailable = item.status === 'available' && item.ownerId !== user?.id;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} backgroundColor="background" p="5" gap="4">
        <Image
          source={{ uri: item.imageUrl }}
          accessibilityLabel={`Ảnh ${item.title}`}
          style={{ width: '100%', height: 220, borderRadius: 12 }}
          resizeMode="cover"
        />
        <YStack gap="2">
          <Text fontSize="8" fontWeight="700" color="color">{item.title}</Text>
          <Text color="color" opacity={0.75}>
            {item.category} · Tình trạng: {item.condition}
          </Text>
          <Text color="color">{item.description}</Text>
          <Text color="color" opacity={0.75}>Người đăng: {item.ownerId}</Text>
          <Text color="color" fontWeight="700">
            Trạng thái: {isAvailable ? 'Còn khả dụng' : 'Không còn khả dụng'}
          </Text>
        </YStack>
        <Separator />
        {isAvailable ? (
          <Link
            href={`/appointment/create?itemId=${encodeURIComponent(item.id)}` as RelativePathString}
            asChild
          >
            <CustomButton>Đặt lịch nhận đồ</CustomButton>
          </Link>
        ) : (
          <Text color="color" opacity={0.7}>
            Món đồ này hiện không thể đặt lịch nhận.
          </Text>
        )}
        <CustomButton
          onPress={() => {
            void shareItem(item.id, item.title).catch((shareError: unknown) => {
              Alert.alert(
                'Không thể chia sẻ',
                shareError instanceof Error ? shareError.message : 'Vui lòng thử lại.',
              );
            });
          }}
        >
          Chia sẻ món đồ
        </CustomButton>
        <CustomButton onPress={() => router.back()}>Quay lại</CustomButton>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ItemDetailScreen;
