/**
 * src/views/screens/ItemListRow.tsx
 *
 * Component hiển thị một hàng món đồ trong danh sách (CLO5, B19).
 * - Bọc React.memo để tối ưu hiệu năng danh sách lớn.
 * - Xử lý ảnh lỗi / rỗng bằng khung hình thay thế.
 * - Cắt mô tả tối đa 2 dòng.
 * - Hiển thị nhãn Danh mục, Tình trạng, Trạng thái.
 * - Hỗ trợ vùng hành động bên dưới (actions) để MyItemsScreen dùng lại ở Giai đoạn 3.
 * - Sử dụng hoàn toàn Tamagui Tokens/Themes, không ghi cứng mã hex.
 */

import React, { memo, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import type { Item } from '../../models/itemModel';
import {
  getCategoryLabel,
  getConditionLabel,
  getStatusLabel,
} from '../../utils/itemOptions';
import { getAccessibilityProps } from '../../utils/accessibility';
import { getPublicUserById } from '../../services/authService';

const ownerNameRequests = new Map<string, Promise<string>>();

function getOwnerName(ownerId: string): Promise<string> {
  const cachedRequest = ownerNameRequests.get(ownerId);
  if (cachedRequest) return cachedRequest;

  const request = getPublicUserById(ownerId)
    .then((user) => user.fullName)
    .catch(() => 'Sinh viên IUH');
  ownerNameRequests.set(ownerId, request);
  return request;
}

export interface ItemListRowProps {
  item: Item;
  onPress?: (item: Item) => void;
  actions?: React.ReactNode;
}

export const ItemListRow = memo(function ItemListRow({
  item,
  onPress,
  actions,
}: ItemListRowProps) {
  const [imageError, setImageError] = useState(false);
  const [ownerName, setOwnerName] = useState(item.ownerName ?? 'Sinh viên IUH');

  useEffect(() => {
    if (item.ownerName) {
      setOwnerName(item.ownerName);
      return;
    }

    let active = true;
    void getOwnerName(item.ownerId).then((name) => {
      if (active) setOwnerName(name);
    });
    return () => {
      active = false;
    };
  }, [item.ownerId, item.ownerName]);

  const categoryLabel = getCategoryLabel(item.category);
  const conditionLabel = getConditionLabel(item.condition);
  const statusLabel = getStatusLabel(item.status);

  const accessibilityText = `Món đồ ${item.title}, người đăng ${ownerName}, danh mục ${categoryLabel}, tình trạng ${conditionLabel}, trạng thái ${statusLabel}`;

  return (
    <Card
      backgroundColor="background"
      borderColor="border-color"
      borderWidth={1}
      rounded="4"
      p="3"
      mb="2"
      scale="press:0.99"
      opacity="press:0.85"
      onPress={onPress ? () => onPress(item) : undefined}
      {...getAccessibilityProps({ role: 'button', label: accessibilityText })}
    >
      <XStack gap="3" items="flex-start">
        {/* Khung ảnh thumbnail hoặc placeholder khi ảnh lỗi/rỗng */}
        {item.imageUrl && !imageError ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 76, height: 76, borderRadius: 8 }}
            resizeMode="cover"
            onError={() => setImageError(true)}
            {...getAccessibilityProps({ label: `Hình ảnh của ${item.title}` })}
          />
        ) : (
          <YStack
            style={{ width: 76, height: 76 }}
            rounded="3"
            backgroundColor="border-color"
            items="center"
            justify="center"
            opacity={0.6}
            {...getAccessibilityProps({ label: 'Ảnh mặc định' })}
          >
            <Text color="color" fontSize="2" fontWeight="700">
              IUH
            </Text>
          </YStack>
        )}

        {/* Thông tin chính của món đồ */}
        <YStack flex={1} gap="1" justify="space-between">
          <Text color="color" fontSize="4" fontWeight="700" numberOfLines={1}>
            {item.title}
          </Text>

          <Text color="color" opacity={0.75} fontSize="2" numberOfLines={1}>
            Người đăng: {ownerName}
          </Text>

          <Text color="color" opacity={0.75} fontSize="3" numberOfLines={2}>
            {item.description}
          </Text>

          {/* Các thẻ nhãn thông tin */}
          <XStack gap="2" items="center" flexWrap="wrap" mt="1">
            <YStack
              px="2"
              py="0.5"
              rounded="2"
              backgroundColor="border-color"
              opacity={0.8}
            >
              <Text color="color" fontSize="1" fontWeight="600">
                {categoryLabel}
              </Text>
            </YStack>

            <YStack
              px="2"
              py="0.5"
              rounded="2"
              backgroundColor="border-color"
              opacity={0.8}
            >
              <Text color="color" fontSize="1">
                {conditionLabel}
              </Text>
            </YStack>

            <YStack
              px="2"
              py="0.5"
              rounded="2"
              backgroundColor="primary"
              opacity={0.9}
            >
              <Text color="background" fontSize="1" fontWeight="700">
                {statusLabel}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </XStack>

      {/* Vùng hành động mở rộng (Sửa/Xóa cho MyItemsScreen ở Giai đoạn 3) */}
      {actions ? <YStack mt="3" pt="2" borderTopWidth={1} borderColor="border-color">{actions}</YStack> : null}
    </Card>
  );
});

export default ItemListRow;
