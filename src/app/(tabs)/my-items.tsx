import { Button, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { useExploreController } from '../../controllers/useExploreController';
import { ProductCard } from '../../views/components/ProductCard';

export default function MyItemsTab() {
  const { user } = useAuthController();
  const { items, isLoading, loadError, retry } = useExploreController();
  const myItems = items.filter((item) => item.ownerId === user?.id);

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack px="4" pt="4" gap="3">
        <Text color="secondary" fontSize="6" fontWeight="800">Đồ dùng của tôi</Text>
        {isLoading ? (
          <Text color="color" opacity={0.65}>Đang tải bài đăng...</Text>
        ) : loadError ? (
          <YStack items="center" gap="3">
            <Text color="color" text="center">{loadError}</Text>
            <Button onPress={retry} theme="active">Thử lại</Button>
          </YStack>
        ) : myItems.length === 0 ? (
          <Text color="color" opacity={0.65}>
            Bạn chưa đăng đồ dùng nào. Nhấn nút + để tạo bài đăng đầu tiên.
          </Text>
        ) : (
          <XStack flexWrap="wrap" justify="space-between">
            {myItems.map((item) => (
              <ProductCard
                key={item.id}
                itemId={item.id}
                title={item.title}
                category={item.category}
                location={item.location ?? 'Trong khuôn viên IUH'}
                distance={item.distance ?? ''}
                price={item.priceVnd === undefined
                  ? 'Trao đổi'
                  : item.priceVnd === 0
                    ? 'Miễn phí'
                    : `${new Intl.NumberFormat('vi-VN').format(item.priceVnd)}đ`}
                ownerName={item.ownerName ?? user?.fullName ?? 'Sinh viên IUH'}
                faculty={item.ownerFaculty ?? ''}
                imageUrl={item.imageUrls?.[0] ?? item.imageUrl}
                available={item.status === 'available'}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
