/**
 * src/app/login.tsx
 *
 * Route "/login" — màn hình đăng nhập tạm.
 * B làm giao diện (B08), A làm xử lý đăng nhập (B09).
 * File này chỉ import và re-export màn hình thật từ src/views/screens.
 */

import { PlaceholderScreen } from '../views/screens/PlaceholderScreen';

export default function LoginRoute() {
  return (
    <PlaceholderScreen
      title="Đăng nhập"
      note="Giao diện: B (B08) · Xử lý đăng nhập: A (B09)"
    />
  );
}
