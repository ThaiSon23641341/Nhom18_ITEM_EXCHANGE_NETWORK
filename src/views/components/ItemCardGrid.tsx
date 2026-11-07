import { memo, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { ImageOff, MapPin } from 'lucide-react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { resolveMediaUrl } from '../../services/api/uploadService';
import { OwnerBadge } from './OwnerBadge';

export interface ItemCardGridProps {
  item: Item;
  onPress: () => void;
}

const formatPrice = (priceVnd?: number): string => {
  if (priceVnd === undefined) return 'Trao đổi';
  if (priceVnd === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(priceVnd)}đ`;
};

export const ItemCardGrid = memo(function ItemCardGrid({
  item,
  onPress,
}: ItemCardGridProps) {
  const sourceUrl = item.imageUrls?.[0] || item.imageUrl;
  const imageUrl = sourceUrl ? resolveMediaUrl(sourceUrl) : '';
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed = failedImageUrl === imageUrl;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết ${item.title}`}
      onPress={onPress}
      style={styles.pressable}
    >
      <Card
        w="100%"
        overflow="hidden"
        backgroundColor="background"
        borderColor="border-color"
        borderWidth={1}
        rounded="4"
      >
        <YStack flex={1}>
          <XStack
            w="100%"
            aspectRatio={1}
            position="relative"
            overflow="hidden"
            backgroundColor="#E8F5EF"
            items="center"
            justify="center"
          >
            {imageUrl && !imageFailed ? (
              <Image
                source={{ uri: imageUrl }}
                resizeMode="cover"
                style={StyleSheet.absoluteFill}
                onError={() => setFailedImageUrl(imageUrl)}
                accessibilityLabel={`Ảnh ${item.title}`}
              />
            ) : (
              <ImageOff size={28} color="#16815D" accessibilityLabel="Không có ảnh món đồ" />
            )}
            {item.status === 'reserved' ? (
              <XStack
                position="absolute"
                t={8}
                l={8}
                px="2"
                py="1"
                rounded="3"
                backgroundColor="#6B7280"
              >
                <Text color="white" fontSize="1" fontWeight="700">
                  Đang giữ
                </Text>
              </XStack>
            ) : null}
          </XStack>

          <YStack flex={1} p="2" gap="1.5">
            <Text color="color" fontSize="3" fontWeight="700" numberOfLines={2}>
              {item.title}
            </Text>
            <Text color="primary" fontSize="2" fontWeight="800" numberOfLines={1}>
              {formatPrice(item.priceVnd)}
            </Text>
            {item.location?.trim() ? (
              <XStack items="center" gap="1">
                <MapPin size={12} color="#6B7280" />
                <Text color="color" opacity={0.65} fontSize="1" numberOfLines={1} flex={1}>
                  {item.location.trim()}
                </Text>
              </XStack>
            ) : null}
            <OwnerBadge
              name={item.ownerName}
              avatarUrl={item.ownerAvatarUrl}
              faculty={item.ownerFaculty}
              compact
            />
          </YStack>
        </YStack>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    width: '48%',
    marginBottom: 12,
  },
});

export default ItemCardGrid;
