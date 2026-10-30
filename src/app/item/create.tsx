/**
 * src/app/item/create.tsx
 *
 * Route "/item/create" — màn hình tạo món đồ mới.
 * Màn hình tạm cho B (B15).
 */

import { Redirect, router } from 'expo-router';
import { useAuthController } from '../../controllers/useAuthController';
import { createItem } from '../../services/api/itemService';
import { CreateItemScreen } from '../../views/screens/CreateItemScreen';

export default function ItemCreateRoute() {
  const { user } = useAuthController();

  if (!user) return <Redirect href="/login" />;

  return (
    <CreateItemScreen
      onBack={() => router.back()}
      onSubmit={async (form) => {
        const condition = form.condition === 'Mới 100%'
          ? 'new'
          : form.condition === 'Như mới'
            ? 'good'
            : 'fair';
        const item = await createItem({
          title: form.name,
          description: form.description,
          category: form.category ?? '',
          condition,
          imageUrl: form.images[0] ?? '',
          imageUrls: form.images,
          ownerId: user.id,
          ownerName: user.fullName,
          ownerAvatarUrl: user.avatarUrl,
          priceVnd: form.price ? Number(form.price) : undefined,
          location: form.location,
        });

        router.replace({ pathname: '/item/[id]', params: { id: item.id } });
      }}
    />
  );
}
