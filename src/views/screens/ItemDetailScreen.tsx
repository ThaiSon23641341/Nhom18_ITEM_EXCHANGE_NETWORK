import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  PackageCheck,
  Share2,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Image, ScrollView, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { useItemDetailController } from '../../controllers/useItemDetailController';
import { shareItem } from '../../services/shareService';
import { goBackOrReplace } from '../../utils/navigation';

const CONDITION_LABELS = {
  new: 'Còn mới',
  good: 'Còn tốt',
  fair: 'Đã qua sử dụng',
} as const;

const STATUS_LABELS = {
  available: 'Còn hàng',
  reserved: 'Đang giữ',
  exchanged: 'Đã trao đổi',
} as const;

const formatPrice = (priceVnd?: number) => {
  if (priceVnd === undefined) return 'Trao đổi';
  if (priceVnd === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(priceVnd)}đ`;
};

export function ItemDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { item, isLoading, loadError, retry } = useItemDetailController(itemId);
  const { user } = useAuthController();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = item?.imageUrls?.length
    ? item.imageUrls
    : item?.imageUrl
      ? [item.imageUrl]
      : [];
  const canBookItem = item?.status === 'available' && item.ownerId !== user?.id;

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center">
        <Text color="color">Đang tải thông tin đồ dùng...</Text>
      </YStack>
    );
  }

  if (loadError || !item) {
    return (
      <YStack flex={1} backgroundColor="background" items="center" justify="center" p="5" gap="3">
        <Text color="color" fontSize="4" text="center">{loadError ?? 'Không tìm thấy đồ dùng.'}</Text>
        <Button onPress={retry} theme="active">Thử lại</Button>
        <Button onPress={() => goBackOrReplace('/(tabs)')}>Quay lại</Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack h={52} px="4" items="center" justify="space-between">
        <Button w={40} h={40} circular backgroundColor="#E8F5EF" borderWidth={0} aria-label="Quay lại" onPress={() => goBackOrReplace('/(tabs)')}>
          <ArrowLeft size={21} color="#145B45" />
        </Button>
        <Text color="secondary" fontSize="5" fontWeight="800">Chi tiết đồ dùng</Text>
        <Button
          w={40}
          h={40}
          circular
          backgroundColor="#E8F5EF"
          borderWidth={0}
          aria-label="Chia sẻ đồ dùng"
          onPress={() => {
            if (!item) return;
            void shareItem(item.id, item.title).catch((error: unknown) => {
              Alert.alert(
                'Không thể chia sẻ',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
              );
            });
          }}
        >
          <Share2 size={20} color="#145B45" />
        </Button>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack px="4" pt="2" pb="4" gap="4">
          <YStack w="100%" aspectRatio={1.6} rounded="5" overflow="hidden" backgroundColor="#E8F5EF" position="relative" items="center" justify="center">
            {images.length > 0 ? (
              <Image src={images[activeImageIndex]} style={{ width: '100%', height: '100%' }} objectFit="cover" aria-label={`Ảnh ${item.title}`} />
            ) : (
              <PackageCheck size={44} color="#16815D" />
            )}
            {images.length > 1 ? (
              <XStack position="absolute" b={3} w="100%" justify="center" gap="2">
                {images.map((image, index) => (
                  <Button
                    key={`${image}-${index}`}
                    w={9}
                    h={9}
                    p={0}
                    circular
                    borderWidth={0}
                    backgroundColor={activeImageIndex === index ? '#16815D' : '#FFFFFF'}
                    aria-label={`Xem ảnh ${index + 1}`}
                    onPress={() => setActiveImageIndex(index)}
                  />
                ))}
              </XStack>
            ) : null}
          </YStack>

          <YStack gap="3">
            <XStack self="flex-start" items="center" gap="2" px="3" py="2" rounded="10" backgroundColor={item.status === 'available' ? '#E4F6EA' : '#EEF1F2'}>
              <PackageCheck size={17} color={item.status === 'available' ? '#16815D' : '#667085'} />
              <Text color={item.status === 'available' ? 'primary' : 'color'} fontSize="2" fontWeight="700">{STATUS_LABELS[item.status]}</Text>
            </XStack>
            <Text color="secondary" fontSize="7" fontWeight="800">{item.title}</Text>
            <XStack items="center" justify="space-between" gap="3">
              <Text color="primary" fontSize="6" fontWeight="800">{formatPrice(item.priceVnd)}</Text>
              <XStack items="center" gap="2" px="3" py="2" rounded="10" backgroundColor="#E8F5EF">
                <Tag size={16} color="#145B45" />
                <Text color="primary" fontSize="2" fontWeight="600">{item.category}</Text>
              </XStack>
            </XStack>
          </YStack>

          <YStack py="3" gap="3" borderTopWidth={1} borderBottomWidth={1} borderColor="border-color">
            <XStack items="center" justify="space-between">
              <XStack items="center" gap="3">
                <ShieldCheck size={20} color="#16815D" />
                <Text color="color" opacity={0.7} fontSize="3">Tình trạng</Text>
              </XStack>
              <Text color="color" fontSize="3" fontWeight="600">{CONDITION_LABELS[item.condition]}</Text>
            </XStack>
            <XStack items="flex-start" gap="3">
              <Tag size={20} color="#16815D" />
              <YStack flex={1} gap="2">
                <Text color="color" opacity={0.7} fontSize="3">Mô tả</Text>
                <Text color="color" fontSize="3">{item.description}</Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack gap="3">
            <Text color="secondary" fontSize="5" fontWeight="800">Người đăng</Text>
            <XStack items="center" gap="3" p="3" rounded="5" borderWidth={1} borderColor="border-color" backgroundColor="#F4F8F5">
              <YStack w={54} h={54} rounded="10" overflow="hidden" backgroundColor="#E8F5EF" items="center" justify="center">
                {item.ownerAvatarUrl ? (
                  <Image src={item.ownerAvatarUrl} style={{ width: '100%', height: '100%' }} objectFit="cover" aria-label={`Ảnh ${item.ownerName ?? 'người đăng'}`} />
                ) : (
                  <UserRound size={25} color="#16815D" />
                )}
              </YStack>
              <YStack flex={1} gap="1">
                <Text color="secondary" fontSize="3" fontWeight="700">{item.ownerName ?? 'Sinh viên IUH'}</Text>
                <Text color="color" opacity={0.65} fontSize="2">{item.ownerFaculty ?? 'Sinh viên IUH'}</Text>
              </YStack>
              <XStack items="center" gap="1">
                <MapPin size={17} color="#667085" />
                <Text color="color" fontSize="2">{item.location ?? 'Trong khuôn viên IUH'}</Text>
                <ChevronRight size={18} color="#16815D" />
              </XStack>
            </XStack>
            <XStack items="center" gap="2" p="3" rounded="5" backgroundColor="#E4F6EA">
              <ShieldCheck size={21} color="#16815D" />
              <Text color="primary" fontSize="2" fontWeight="600" flex={1}>Hẹn nhận tại nơi công cộng trong trường IUH</Text>
            </XStack>
            <Button
              self="flex-start"
              backgroundColor="transparent"
              borderWidth={0}
              px="0"
              gap="2"
              onPress={() => router.push({ pathname: '/item/[id]/report', params: { id: item.id } })}
              aria-label="Báo cáo bài đăng"
            >
              <Text color="color" opacity={0.7} fontSize="2">Bài đăng có vấn đề?</Text>
              <Text color="primary" fontSize="2" fontWeight="700">Báo cáo</Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      <XStack px="4" pt="3" pb="3" gap="3" borderTopWidth={1} borderTopColor="border-color" backgroundColor="background">
        <Button
          w={54}
          h={52}
          rounded="5"
          backgroundColor={isFavorite ? '#E4F6EA' : '#F4F8F5'}
          borderWidth={1}
          borderColor="border-color"
          aria-label={isFavorite ? 'Bỏ lưu đồ dùng' : 'Lưu đồ dùng'}
          aria-pressed={isFavorite}
          onPress={() => setIsFavorite((favorite) => !favorite)}
        >
          {isFavorite ? <Check size={22} color="#16815D" /> : <Heart size={22} color="#145B45" />}
        </Button>
        <Button
          flex={1}
          h={52}
          rounded="5"
          backgroundColor="primary"
          borderWidth={0}
          disabled={!canBookItem}
          opacity={canBookItem ? 1 : 0.6}
          icon={<CalendarDays size={20} color="#FFFFFF" />}
          onPress={() => router.push({
            pathname: '/appointment/create',
            params: { itemId: item.id },
          })}
          aria-disabled={!canBookItem}
        >
          <Button.Text color="white" fontSize="3" fontWeight="700">
            {item.ownerId === user?.id ? 'Đồ dùng của bạn' : item.status === 'available' ? 'Đặt lịch nhận đồ' : 'Không còn khả dụng'}
          </Button.Text>
        </Button>
      </XStack>
    </YStack>
  );
}

export default ItemDetailScreen;
