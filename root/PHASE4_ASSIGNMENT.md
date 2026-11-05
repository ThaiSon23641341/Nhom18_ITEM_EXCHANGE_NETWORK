# Giai đoạn 4 — phân lại theo chức năng và endpoint

**Ngày lập:** 05/11/2026. **Mốc:** `main` tại `51de51c`. Tài liệu này thay thế phần phân công file của Giai đoạn 3 ở những chỗ mâu thuẫn. Không sửa `root/PROJECT_INSTRUCTIONS.md`.

**Nguyên tắc:** ai làm chức năng nào thì sở hữu **endpoint + service + màn hình + test** của chức năng đó và tự kiểm thử nó. Sơn chỉ giữ những phần dùng chung (khung server, người dùng, dependency, CI, nhật ký). Một file chỉ có một chủ.

## 1. Vì sao cần phân lại

Hai PR đang mở đều sửa file của người khác (`package*.json`, `server/**`, `itemService.ts`, màn hình của Phúc…). Nguyên nhân gốc là toàn bộ backend nằm trong một file `server/server.cjs` và một `server/db.json`, nên ai thêm endpoint cũng phải sửa file của Sơn. Cách khắc phục: **tách server thành mỗi chức năng một file route**, mỗi người sửa file của mình.

## 2. Ai phụ trách endpoint nào

Server: JSON Server cổng 3001. Client gọi qua `src/services/api/apiClient.ts`.

| Người | Chức năng | Endpoint | Client service | Màn hình / route |
| --- | --- | --- | --- | --- |
| **Sơn (A)** | Khung server và người dùng | `GET /health`, `POST /users` (đăng ký/đăng nhập demo), `GET /users/:id/public` (không lộ số điện thoại) | `authService.ts`, `src/store/**`, `apiClient.ts` | `LoginScreen` chỉ phần logic auth qua `useAuthController` |
| **Phú (C)** | Bài đăng món đồ | `GET /items`, `GET /items/:id`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id` — **chặn sửa/xóa món `exchanged`** | `itemService.ts`, `usePaginatedItems`, `itemPermissions.ts` | Khám phá, Của tôi, tạo/sửa bài, chi tiết (route/controller) |
| **Phú (C)** | Báo cáo và kiểm duyệt | `POST /reports`, `GET /reports`, `PATCH /reports/:id` | `reportService.ts` | Kiểm duyệt báo cáo, controller báo cáo |
| **Tú (D)** | Lịch hẹn | `GET /appointments?requesterId=` hoặc `?userId=`, `POST /appointments`, `PATCH /appointments/:id/status` (`pending→confirmed/cancelled`, `confirmed→cancelled/completed`) | `src/services/api/appointmentService.ts`, `src/services/appointments/**` | Tab Lịch hẹn, `appointment/create`, `appointment/confirm`, `item/[id]/book` |
| **Tú (D)** | Chia sẻ, deep link, thiết bị | không có endpoint | `shareService.ts`, `src/services/device/**` | Nhận link `nhom18item://item/<id>` (hook mới `useDeepLinkController.ts`) |
| **Phúc (B)** | Yêu thích | `GET /favorites?userId=`, `POST /favorites`, `DELETE /favorites/:id` | `favoriteService.ts`, `favoriteModel.ts` | Nút yêu thích ở chi tiết, danh sách yêu thích trong hồ sơ |
| **Phúc (B)** | Hồ sơ và giao diện | `GET /users/:id/public` (chỉ đọc, do Sơn cung cấp) | — | `ProfileScreen`, `ItemDetailScreen`, `LoginScreen` (UI), `ItemReportScreen` (UI) |

**Hợp đồng chung:**
- Ngày lịch hẹn là `dd/mm/yyyy`, giờ `HH:mm`. Không dùng `yyyy-mm-dd` ở bất kỳ test nào.
- `POST /appointments` đặt món sang `reserved`. Route lịch hẹn của Tú chỉ được đổi `status` của món (`reserved`/`available`); quy tắc sửa/xóa vẫn thuộc route món của Phú.
- Lỗi trả về dạng `{ code, message }` qua helper chung của Sơn.

## 3. Phân file (chủ duy nhất)

| Người | File/thư mục |
| --- | --- |
| **Sơn** | `package.json`, `package-lock.json`, `server/package*.json`, `.github/**`, `root/PROJECT_PROGRESS.md`, `server/server.cjs` (chỉ khởi tạo và gắn route), `server/lib/**` (helper dùng chung), `server/routes/users.cjs`, `server/db.json`, `server/README.md`, `src/models/index.ts`, `src/models/userModel.ts`, `src/store/**`, `src/services/authService.ts`, `src/services/api/apiClient.ts`, `src/controllers/useAuthController.ts`(+test), `.env.example` |
| **Phú** | `server/routes/items.cjs`, `server/routes/reports.cjs`, `server/test/items.test.cjs`, `server/test/reports.test.cjs`, `src/models/itemModel.ts`, `src/services/api/itemService.ts`(+test), `src/services/api/reportService.ts`(+test), `src/utils/itemPermissions.ts`(+test), `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx` và các route trong `src/app/**` đã liệt kê ở Giai đoạn 3, `useItem*Controller`, `useExploreController`, `useMyItemsController`, `usePaginatedItems`, `useItemReportController`, `useReportModerationController`, `ExploreScreen`, `MyItemsScreen`, `ItemFormScreen`, `ItemFilterBar`, `ItemListRow`, `ListStateView`, `ReportModerationScreen`, `src/utils/itemFilters*`, `src/utils/validateItem*` |
| **Tú** | `server/routes/appointments.cjs`, `server/test/appointments.test.cjs`, `src/models/appointmentModel.ts`, `src/services/api/appointmentService.ts`(+test), `src/services/appointments/**`, `src/services/device/**`, `src/services/shareService.ts`, `src/controllers/useAppointment*Controller.ts`, `src/controllers/useDeepLinkController.ts` (mới), `AppointmentsScreen`, `BookAppointmentScreen`, `src/app/(tabs)/appointments.tsx`, `src/app/appointment/**`, `src/app/(tabs)/item/[id]/book.tsx`, `src/__tests__/**`, `eas.json`, `root/PHASE3_QA_CHECKLIST.md` |
| **Phúc** | `server/routes/favorites.cjs`, `server/test/favorites.test.cjs`, `src/models/favoriteModel.ts`, `src/services/api/favoriteService.ts`(+test), `src/views/components/**`, `assets/**`, `tamagui.config.ts`, `ProfileScreen.tsx`, `src/app/(tabs)/profile.tsx`, `ItemDetailScreen.tsx`, `LoginScreen.tsx`, `ItemReportScreen.tsx` |

Khi cần sửa file của người khác: gửi yêu cầu cho chủ file. Riêng `package*.json` và `server/db.json` chỉ Sơn sửa; cần dữ liệu mẫu hoặc dependency thì nhờ Sơn trước khi mở PR.

## 4. Việc nhầm sang Sơn nay trả về đúng người

| Việc | Trước đây | Nay |
| --- | --- | --- |
| Endpoint và logic lịch hẹn trong server | Nằm trong file của Sơn | **Tú** (`server/routes/appointments.cjs`) |
| Endpoint và model yêu thích | Tú làm, file của Sơn | **Phúc** |
| `itemService.ts`, `reportService.ts` và endpoint món/báo cáo | Sơn | **Phú** |
| `appointmentService.ts` (api) | Mâu thuẫn tài liệu | **Tú** |
| Màn hình Hồ sơ | Phú tự làm trong PR #22 | **Phúc** |
| Xử lý deep link ở `_layout.tsx` | Tú sửa file của Phú | **Tú** viết `useDeepLinkController.ts`; Phú gắn một dòng vào `_layout.tsx` |
| Safe-area của tab, Login, Report | Tú sửa | Tab → **Phú**; Login, Report → **Phúc** |
| Bỏ kiểm tra mô tả tối thiểu trong `validateItem` | Tú sửa | **Phú** quyết định |

## 5. Xử lý hai PR đang mở

**PR #21 (Tú)** — giữ: lịch hẹn, `confirm`, `create`, `shareService`, `services/appointments`, `api/appointmentService(.test)`, `__tests__/appointmentService.test.ts`, và phần route lịch hẹn chuyển sang `server/routes/appointments.cjs`. Gỡ khỏi PR: `package*.json`, `server/package*.json`, `server/db.json`, `favorite*`, `src/models/index.ts`, `ItemDetailScreen`, `LoginScreen`, `ItemReportScreen`, `ItemFormScreen`, `ItemListRow`, `useItem*Controller`, `validateItem*`, `_layout.tsx` (hai file). Các thay đổi bị gỡ được gửi cho chủ file theo bảng mục 4. Đổi tên nhánh `Tú` thành tên ASCII, ví dụ `tu-appointments`.

**PR #22 (Phú)** — giữ: `useMyItemsController`, `MyItemsScreen`, `itemService.ts`(+test), `itemPermissions.ts`(+test). Gỡ: `package*.json`, `ProfileScreen`, `profile.tsx` (gửi Phúc làm gốc), `root/PROJECT_PROGRESS.md`, hai file test lịch hẹn (Tú tự cập nhật). Đổi tên nhánh sang ASCII, ví dụ `phu-items`.

## 6. Thứ tự merge

1. **Sơn**: tách khung `server/routes/*.cjs`, `server/lib/**`, tạo file route rỗng cho từng người, nâng dependency **một lần**, merge trước.
2. **Tú, Phú, Phúc** rebase từ `main` sau bước 1 và mở PR riêng. Các file route khác nhau nên không xung đột.
3. Thứ tự gợi ý: Tú → Phú → Phúc. Sau mỗi PR, người tiếp theo `git fetch` và rebase.
4. Sơn cập nhật nhật ký sau khi nhận báo cáo kết quả.

## 7. Ai test chức năng nào

Mỗi người ghi kết quả Pass/Fail trong `root/PHASE3_QA_CHECKLIST.md` (Tú tạo) theo phần của mình. Trước khi mở PR chạy `npx tsc --noEmit`, `npm run lint`, `npm test` và test server tương ứng.

| Người | Test thủ công | Test tự động |
| --- | --- | --- |
| **Sơn** | Đăng nhập email demo, đăng xuất, email không tồn tại; `/users/:id/public` không có số điện thoại; `/health` | `server/test` cho users; `authService.test.ts` |
| **Phú** | Xem/tìm/lọc/phân trang; tạo, sửa, xóa bài của mình; sửa bài người khác bị chặn; món `exchanged` không sửa/xóa; báo cáo bài và kiểm duyệt; mở trực tiếp URL chi tiết rồi bấm quay lại | `items.test.cjs`, `reports.test.cjs`, `itemService.test.ts`, `itemPermissions.test.ts`, `usePaginatedItems.test.ts` |
| **Tú** | Đặt lịch bằng `item-001` (tài khoản `21036011.test@student.iuh.edu.vn`); ngày hợp lệ, `31/02`, quá khứ, sai định dạng; đặt món của chính mình bị chặn; xác nhận/hủy/hoàn thành; nhắc lịch; camera, chọn ảnh; mở link `nhom18item://item/<id>` | `appointments.test.cjs`, `appointmentService.test.ts`, `notificationService.test.ts` |
| **Phúc** | Hồ sơ hiển thị đúng; thêm/bỏ yêu thích, thêm trùng bị chặn; chi tiết, đăng nhập, báo cáo hiển thị đúng và nhãn accessibility trên Web, iOS, Android | `favorites.test.cjs`, `favoriteService.test.ts` |

## 8. Việc phải xác nhận

- Bạn duyệt việc tách `server/` thành các file route và giao từng file cho chủ chức năng.
- Phúc có nhận tính năng yêu thích không. Nếu không, bỏ `favorites` khỏi phạm vi.
- `src/utils/itemPermissions.ts` là file mới của Phú.

> Đây là kế hoạch phân công, chưa phải kết quả đã thực hiện. Việc tách server và xử lý lại hai PR cần từng người làm theo các mục trên.
