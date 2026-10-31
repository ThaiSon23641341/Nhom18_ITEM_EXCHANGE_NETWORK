import { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Heart, MapPin, Tag, UserRound } from 'lucide-react-native';
import { Button, Card, Image, Text, XStack, YStack } from 'tamagui';

export interface ProductCardProps {
  itemId: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  price: string;
  ownerName: string;
  faculty: string;
  imageUrl: string;
  available?: boolean;
  createdAt?: string;
  priceVnd?: number;
}

export function ProductCard({ itemId, title, category, location, distance, price, ownerName, faculty, imageUrl, available = true }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Pressable
      {...(Platform.OS === 'web'
        ? { 'aria-label': `Xem chi tiết ${title}` }
        : { accessibilityRole: 'link' as const, accessibilityLabel: `Xem chi tiết ${title}` })}
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: itemId } })}
      style={{ width: '48%', marginBottom: 12 }}
    >
      <Card backgroundColor="background" borderColor="border-color" borderWidth={1} rounded="5" overflow="hidden" w="100%" shadowColor="shadow-color" shadowOpacity={0.08} shadowRadius={8} shadowOffset={{ width: 0, height: 3 }}>
        <YStack>
          <YStack w="100%" aspectRatio={1.9} backgroundColor="#E8F5EF" position="relative">
            {imageUrl ? (
              <Image src={imageUrl} style={{ width: '100%', height: '100%' }} objectFit="cover" aria-label={`Ảnh ${title}`} />
            ) : (
              <YStack flex={1} items="center" justify="center">
                <Tag size={28} color="#16815D" />
              </YStack>
            )}
            <XStack position="absolute" t={8} l={8} backgroundColor={available ? '#16815D' : '#6B7280'} px="2" py="1" rounded="10">
              <Text color="white" fontSize="1" fontWeight="700">{available ? 'Còn hàng' : 'Đang giữ'}</Text>
            </XStack>
            <Button
              position="absolute"
              t={8}
              r={8}
              w={34}
              h={34}
              circular
              backgroundColor="background"
              opacity={0.95}
              aria-label={isFavorite ? `Bỏ lưu ${title}` : `Lưu ${title} vào danh sách yêu thích`}
              onPress={(event) => {
                event.stopPropagation();
                setIsFavorite((favorite) => !favorite);
              }}
            >
              <Heart size={17} color="#16815D" fill={isFavorite ? '#16815D' : 'transparent'} />
            </Button>
          </YStack>
          <YStack p="2" gap="1">
            <Text color="color" fontSize="3" fontWeight="700" numberOfLines={1}>{title}</Text>
            <XStack items="center" self="flex-start" gap="1" backgroundColor="#E8F5EF" px="2" py="1" rounded="3">
              <Tag size={12} color="#16815D" />
              <Text color="primary" fontSize="1" numberOfLines={1}>{category}</Text>
            </XStack>
            <XStack items="center" justify="space-between" gap="1">
              <XStack items="center" gap="1" flex={1}>
                <MapPin size={13} color="#6B7280" />
                <Text color="color" opacity={0.65} fontSize="2" numberOfLines={1} flex={1}>{distance ? `${location} · ${distance}` : location}</Text>
              </XStack>
              <Text color="primary" fontSize="2" fontWeight="800" numberOfLines={1}>{price}</Text>
            </XStack>
            <XStack items="center" gap="2" pt="1">
              <YStack w={28} h={28} rounded="10" backgroundColor="#E8F5EF" items="center" justify="center"><UserRound size={15} color="#16815D" /></YStack>
              <YStack flex={1}>
                <Text color="color" fontSize="2" fontWeight="600" numberOfLines={1}>{ownerName}</Text>
                <Text color="color" opacity={0.65} fontSize="1" numberOfLines={1}>{faculty}</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </Pressable>
  );
}

export default ProductCard;
