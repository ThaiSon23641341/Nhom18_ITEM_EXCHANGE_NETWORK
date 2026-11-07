import { memo, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { ImageOff, MapPin, Tag } from 'lucide-react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import { resolveMediaUrl } from '../../services/api/uploadService';
import { getCategoryLabel } from '../../utils/itemOptions';
import { OwnerBadge } from './OwnerBadge';

export interface ItemCardLargeProps {
  item: Item;
  onPress: () => void;
}

const formatPrice = (priceVnd?: number): string => {
  if (priceVnd === undefined) return 'Trao đổi';
  if (priceVnd === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(priceVnd)}đ`;
};

export const ItemCardLarge = memo(function ItemCardLarge({
  item,
  onPress,
}: ItemCardLargeProps) {
  const sourceUrl = item.imageUrls?.[0] || item.imageUrl;
  const imageUrl = sourceUrl ? resolveMediaUrl(sourceUrl) : '';
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed = failedImageUrl === imageUrl;
  const price = formatPrice(item.priceVnd);

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
        rounded="5"
        shadowColor="shadow-color"
        shadowOpacity={0.08}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: 3 }}
      >
        <YStack>
          <YStack p="3">
            <OwnerBadge
              name={item.ownerName}
              avatarUrl={item.ownerAvatarUrl}
              faculty={item.ownerFaculty}
            />
          </YStack>

          <XStack
            w="100%"
            aspectRatio={4 / 3}
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
              <ImageOff size={36} color="#16815D" accessibilityLabel="Không có ảnh món đồ" />
            )}
            {item.status === 'reserved' ? (
              <XStack
                position="absolute"
                t={10}
                l={10}
                px="2"
                py="1"
                rounded="3"
                backgroundColor="#6B7280"
              >
                <Text color="white" fontSize="2" fontWeight="700">
                  Đang giữ
                </Text>
              </XStack>
            ) : null}
          </XStack>

          <YStack p="3" gap="2">
            <Text color="color" fontSize="5" fontWeight="800" numberOfLines={2}>
              {item.title}
            </Text>

            <XStack
              self="flex-start"
              items="center"
              gap="1"
              px="2"
              py="1"
              rounded="3"
              backgroundColor="#E8F5EF"
            >
              <Tag size={13} color="#16815D" />
              <Text color="primary" fontSize="2" numberOfLines={1}>
                {getCategoryLabel(item.category)}
              </Text>
            </XStack>

            <XStack items="center" justify="space-between" gap="2">
              <Text color="primary" fontSize="3" fontWeight="800" numberOfLines={1} flex={1}>
                {price}
              </Text>
              {item.location?.trim() ? (
                <XStack items="center" gap="1" flex={1} justify="flex-end">
                  <MapPin size={14} color="#6B7280" />
                  <Text color="color" opacity={0.7} fontSize="2" numberOfLines={1} flex={1}>
                    {item.location.trim()}
                  </Text>
                </XStack>
              ) : null}
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    marginBottom: 12,
  },
});

export default ItemCardLarge;
