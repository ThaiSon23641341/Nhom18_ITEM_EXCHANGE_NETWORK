import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Award,
  GraduationCap,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Button, Image, ScrollView, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { useFavoritesController } from '../../controllers/useFavoritesController';
import { usePublicProfileController } from '../../controllers/usePublicProfileController';
import type { Item } from '../../models/itemModel';
import { getItemById, MockApiError } from '../../services/api/itemService';
import { resolveMediaUrl } from '../../services/api/uploadService';
import { MOCK_USER } from '../../utils/constants';

interface FavoriteItem {
  id: string;
  item: Item | null;
}

const formatPrice = (priceVnd?: number): string => {
  if (priceVnd === undefined) return 'Trao đổi';
  if (priceVnd === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(priceVnd)}đ`;
};

export function ProfileScreen() {
  const { user, logout } = useAuthController();
  const userId = user?.id ?? MOCK_USER.id;
  const {
    profile,
    isLoading: isLoadingProfile,
    error: profileError,
    retry: retryProfile,
  } = usePublicProfileController(userId);
  const {
    favorites,
    isLoading: isLoadingFavorites,
    error: favoritesError,
    pendingItemIds,
    retry: retryFavorites,
    toggleFavorite,
  } = useFavoritesController(userId);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemRetryCount, setItemRetryCount] = useState(0);
  const localUser = user ?? MOCK_USER;
  const displayedUser = {
    ...localUser,
    ...profile,
    fullName: profile?.fullName ?? localUser.fullName,
    avatarUrl: profile?.avatarUrl ?? localUser.avatarUrl ?? '',
  };

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingItems(true);
    setItemsError(null);
    Promise.all(favorites.map(async (favorite): Promise<FavoriteItem> => {
      try {
        return { id: favorite.itemId, item: await getItemById(favorite.itemId) };
      } catch (error) {
        if (error instanceof MockApiError && error.code === 'NOT_FOUND') {
          return { id: favorite.itemId, item: null };
        }
        throw error;
      }
    }))
      .then((loadedItems) => {
        if (active) setItems(loadedItems);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setItems([]);
        setItemsError(error instanceof Error ? error.message : 'Không thể tải các món đồ yêu thích.');
      })
      .finally(() => {
        if (active) setIsLoadingItems(false);
      });

    return () => {
      active = false;
    };
  }, [favorites, itemRetryCount]);

  const favoriteError = favoritesError ?? itemsError;
  const isLoadingFavoriteList = isLoadingFavorites || isLoadingItems;

  const retryFavoriteList = () => {
    retryFavorites();
    setItemRetryCount((count) => count + 1);
  };

  return (
    <ScrollView flex={1} backgroundColor="background">
      <YStack w="100%" maxW={720} self="center" p="4" gap="5">
        <YStack gap="2">
          <Text color="secondary" fontSize="7" fontWeight="800" accessibilityRole="header">
            Hồ sơ của tôi
          </Text>
          <Text color="color" opacity={0.7} fontSize="3">
            Thông tin tài khoản và các đồ dùng bạn đã lưu.
          </Text>
        </YStack>

        <YStack p="4" gap="4" rounded="5" borderWidth={1} borderColor="border-color">
          <XStack items="center" gap="3">
            <YStack w={64} h={64} rounded="full" backgroundColor="#E8F5EF" items="center" justify="center">
              {displayedUser.avatarUrl ? (
                <Image
                  src={resolveMediaUrl(displayedUser.avatarUrl)}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                  objectFit="cover"
                  accessibilityLabel={`Ảnh đại diện ${displayedUser.fullName}`}
                />
              ) : <UserRound size={30} color="#16815D" />}
            </YStack>
            <YStack flex={1} gap="1">
              <Text color="secondary" fontSize="5" fontWeight="800">{displayedUser.fullName}</Text>
              <Text color="color" opacity={0.7} fontSize="3">{displayedUser.email}</Text>
            </YStack>
          </XStack>
          {displayedUser.studentId ? (
            <ProfileInfoRow
              icon={<UserRound size={17} color="#16815D" />}
              label="Mã sinh viên"
              value={displayedUser.studentId}
            />
          ) : null}
          <ProfileInfoRow
            icon={<GraduationCap size={17} color="#16815D" />}
            label="Khoa"
            value={displayedUser.faculty}
          />
          <ProfileInfoRow
            icon={<GraduationCap size={17} color="#16815D" />}
            label="Lớp"
            value={displayedUser.className}
          />
          <ProfileInfoRow
            icon={<Award size={17} color="#16815D" />}
            label="Giao dịch thành công"
            value={displayedUser.successfulExchanges?.toString()}
          />
          <ProfileInfoRow
            icon={<ShieldCheck size={17} color="#16815D" />}
            label="Uy tín"
            value={displayedUser.reputation?.toString()}
          />
          {profileError ? (
            <XStack items="center" justify="space-between" gap="3">
              <Text color="color" flex={1} accessibilityRole="alert">{profileError}</Text>
              <Button minH={44} onPress={retryProfile} accessibilityRole="button" accessibilityLabel="Tải lại hồ sơ công khai">Thử lại</Button>
            </XStack>
          ) : isLoadingProfile ? (
            <Text color="color" opacity={0.7} accessibilityLabel="Đang tải hồ sơ công khai">
              Đang tải hồ sơ...
            </Text>
          ) : null}
        </YStack>

        {user ? (
          <XStack gap="3" flexWrap="wrap">
            <Button
              minH={48}
              theme="active"
              icon={<Pencil size={18} color="white" />}
              onPress={() => router.push('/profile/edit')}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa hồ sơ"
            >
              Chỉnh sửa hồ sơ
            </Button>
            <Button
              minH={48}
              borderColor="#D92D20"
              color="#B42318"
              backgroundColor="transparent"
              icon={<LogOut size={18} color="#B42318" />}
              onPress={() => {
                logout();
                router.replace('/login');
              }}
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất"
            >
              Đăng xuất
            </Button>
          </XStack>
        ) : null}

        <YStack gap="3">
          <XStack items="center" justify="space-between">
            <XStack items="center" gap="2">
              <Heart size={20} color="#16815D" />
              <Text color="secondary" fontSize="5" fontWeight="800" accessibilityRole="header">
                Đồ dùng yêu thích
              </Text>
            </XStack>
            <Text color="color" opacity={0.7} fontSize="3">{favorites.length} món</Text>
          </XStack>

          {isLoadingFavoriteList ? (
            <Text color="color" opacity={0.7} accessibilityLabel="Đang tải đồ dùng yêu thích">
              Đang tải đồ dùng yêu thích...
            </Text>
          ) : favoriteError ? (
            <YStack items="center" gap="3" p="5">
              <Text color="color" text="center" accessibilityRole="alert">{favoriteError}</Text>
              <Button minH={44} onPress={retryFavoriteList} accessibilityRole="button" accessibilityLabel="Thử tải lại danh sách yêu thích">
                Thử lại
              </Button>
            </YStack>
          ) : items.length === 0 ? (
            <YStack items="center" justify="center" gap="3" p="6" rounded="5" borderWidth={1} borderColor="border-color">
              <Heart size={28} color="#16815D" />
              <Text color="color" text="center">Chưa có đồ dùng yêu thích.</Text>
              <Button minH={44} theme="active" onPress={() => router.replace('/(tabs)')} accessibilityRole="button" accessibilityLabel="Khám phá đồ dùng">
                Khám phá đồ dùng
              </Button>
            </YStack>
          ) : (
            <YStack gap="3">
              {items.map(({ id, item }) => item ? (
                <XStack key={id} p="3" gap="3" rounded="5" borderWidth={1} borderColor="border-color">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrls?.[0] ?? item.imageUrl}
                      style={{ width: 84, height: 84, borderRadius: 12 }}
                      objectFit="cover"
                      accessibilityLabel={`Ảnh ${item.title}`}
                    />
                  ) : (
                    <YStack w={84} h={84} rounded="4" backgroundColor="#E8F5EF" items="center" justify="center" accessibilityElementsHidden>
                      <Package size={28} color="#16815D" />
                    </YStack>
                  )}
                  <YStack flex={1} justify="space-between" gap="2">
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Xem chi tiết ${item.title}`}
                      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id, returnTo: 'profile' } })}
                    >
                      <YStack gap="1">
                        <Text color="secondary" fontSize="3" fontWeight="700" numberOfLines={2}>{item.title}</Text>
                        <Text color="primary" fontSize="2" fontWeight="700">{formatPrice(item.priceVnd)}</Text>
                        <XStack items="center" gap="1">
                          <MapPin size={13} color="#667085" />
                          <Text color="color" opacity={0.7} fontSize="1" numberOfLines={1}>
                            {item.location ?? 'Trong khuôn viên IUH'}
                          </Text>
                        </XStack>
                      </YStack>
                    </Pressable>
                    <Button
                      self="flex-start"
                      minH={44}
                      px="2"
                      backgroundColor="transparent"
                      borderWidth={0}
                      onPress={() => void toggleFavorite(item.id)}
                      disabled={pendingItemIds.has(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Bỏ ${item.title} khỏi danh sách yêu thích`}
                      accessibilityState={{ disabled: pendingItemIds.has(item.id), busy: pendingItemIds.has(item.id) }}
                    >
                      <XStack items="center" gap="1">
                        <Heart size={16} color="#E11D48" fill="#E11D48" />
                        <Button.Text color="color" fontSize="2">Bỏ lưu</Button.Text>
                      </XStack>
                    </Button>
                  </YStack>
                </XStack>
              ) : (
                <XStack key={id} items="center" justify="space-between" gap="3" p="4" rounded="5" borderWidth={1} borderColor="border-color">
                  <Text color="color" flex={1}>Bài đăng này không còn khả dụng.</Text>
                  <Button
                    minH={44}
                    onPress={() => void toggleFavorite(id)}
                    disabled={pendingItemIds.has(id)}
                    accessibilityRole="button"
                    accessibilityLabel="Xóa bài đăng không còn khả dụng khỏi danh sách yêu thích"
                  >
                    Bỏ lưu
                  </Button>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <XStack
      items="center"
      gap="2"
      borderTopWidth={1}
      borderTopColor="border-color"
      pt="3"
    >
      {icon}
      <Text color="color" fontSize="3">
        {label}: {value?.trim() || 'Chưa cập nhật'}
      </Text>
    </XStack>
  );
}

export default ProfileScreen;
