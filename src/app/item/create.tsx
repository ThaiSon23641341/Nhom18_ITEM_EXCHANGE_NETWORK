/**
 * src/app/item/create.tsx
 *
 * Route "/item/create" — màn hình tạo món đồ mới.
 * Màn hình tạm cho B (B15).
 */

import { router } from 'expo-router';
import { CreateItemScreen } from '../../views/screens/CreateItemScreen';

export default function ItemCreateRoute() {
  return <CreateItemScreen onBack={() => router.back()} />;
}
