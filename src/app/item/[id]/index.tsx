/**
 * src/app/item/[id]/index.tsx
 *
 * Route "/item/[id]" — chi tiết món đồ.
 * File này chỉ import và re-export màn hình thật từ src/views/screens.
 * B sẽ làm giao diện thật (B22).
 */

import { ItemDetailScreen } from '../../../views/screens/ItemDetailScreen';

export default function ItemDetailRoute() {
  return <ItemDetailScreen />;
}
