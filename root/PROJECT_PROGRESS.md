# Theo dõi tiến độ và checkpoint dự án

Tài liệu này tổng hợp tiến độ có thể đối chiếu trên GitHub/Git tại mỗi checkpoint. Cập nhật nhật ký khi tạo PR, khi PR được merge/yêu cầu sửa, hoặc khi trạng thái công việc thay đổi. Không xóa lịch sử; nếu kết quả bị revert, thêm dòng cập nhật mới.

## Quy ước trạng thái

| Trạng thái | Ý nghĩa |
| --- | --- |
| Chưa bắt đầu | Chưa có phần việc hoặc nhánh được ghi nhận |
| Đang làm | Đã bắt đầu nhưng chưa tạo pull request |
| Chờ review | Đã có pull request, chưa merge vào nhánh đích |
| Đã merge | Đã merge vào nhánh đích, chưa nghiệm thu đầy đủ |
| Hoàn thành | Đã merge, luồng chính đã chạy thử hoặc có test tương ứng, không còn lỗi nghiêm trọng đã biết, và giao diện/validation/phân quyền liên quan đạt yêu cầu |
| Bị chặn | Không thể tiếp tục vì phụ thuộc, xung đột hoặc lỗi cần người khác xử lý |

Chỉ đánh dấu **Hoàn thành** khi có bằng chứng kiểm thử/demo và đáp ứng các tiêu chí liên quan. Không ước lượng phần trăm hoàn thành theo cảm tính.

## Nhật ký công việc

| Ngày | Người thực hiện | Use case/phần việc | Kết quả cụ thể | Trạng thái | Branch/PR/commit | Test hoặc demo | Việc tiếp theo/vướng mắc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 22/10/2026 | `lmphuc1701` | Giao diện đăng nhập và điều hướng | PR thêm `LoginScreen`, ảnh đăng nhập và cập nhật cấu hình/thư viện liên quan; PR hiện chưa merge | Bị chặn | [PR #3](https://github.com/ThaiSon23641341/Nhom18_ITEM_EXCHANGE_NETWORK/pull/3), branch `phuc23636991`, commit `50beabc` | Chưa có kết quả test/demo được xác minh trong checkpoint này; GitHub báo PR có xung đột (`dirty`) | Cập nhật nhánh với `main`, xử lý xung đột, chạy lại kiểm tra rồi yêu cầu review |
| 23/10/2026 | `ThaiSon23641341` | Giao diện đăng nhập | PR #3 đã được merge vào `main`; bổ sung giao diện đăng nhập mức demo, chưa bao gồm nghiệp vụ xác thực | Đã merge | [PR #3](https://github.com/ThaiSon23641341/Nhom18_ITEM_EXCHANGE_NETWORK/pull/3), branch `phuc23636991`, merge commit `8c2bb14` | Trên `main`: `npx tsc --noEmit` đạt; 11/11 Jest tests hiện có đạt (đều tập trung vào report service); ESLint không lỗi, có 2 cảnh báo (router types và biến chưa dùng); GitHub CI của PR xanh | Demo giao diện trên app nếu cần nghiệm thu; bổ sung xác thực và bảo vệ route trong phạm vi công việc riêng |
| 22/10/2026 | `ThaiSon23641341` | Báo cáo vi phạm và hàng chờ kiểm duyệt demo | Thêm gửi báo cáo, trạng thái xử lý/bỏ qua, phân trang, màn hình moderation demo và thiết lập Jest/CI | Đã merge | [PR #4](https://github.com/ThaiSon23641341/Nhom18_ITEM_EXCHANGE_NETWORK/pull/4), branch `feature/son-reporting-test-setup`, merge commit `b64435e` | 11/11 Jest tests đạt; `npx tsc --noEmit` và `npm run lint` đạt. Chưa có bằng chứng demo UI thủ công | Chạy thử luồng trên app; trước khi dùng thực tế cần backend và xác thực/phân quyền moderator |
| 23/10/2026 | `ThaiSon23641341` | Thiết kế model và backend API mẫu (A) | Tạo model API cho user/item/appointment/report, dữ liệu seed và REST API Express dùng in-memory store; chưa kết nối MongoDB hoặc ứng dụng Expo | Đang làm | Branch `test/review-rules-20261022`, chưa tạo PR | Backend build đạt, 9/9 API tests đạt; TypeScript app đạt; 11/11 Jest tests đạt; ESLint không lỗi nhưng còn 2 cảnh báo có sẵn | B02 mới có schema/index proposal và API demo; B03 Redux, xác thực thật B09–B10 và kết nối database vẫn chưa làm. API chưa có authentication/authorization, không dùng production |

## Giai đoạn 2 — kiểm kê và phân công file

**Mốc đối chiếu:** `main` tại `c32d7ad` (23/10/2026). Phân công dưới đây dựa trên danh sách A–D trong `root/PROJECT_INSTRUCTIONS.md`; thành viên C là Phú. Đây là kế hoạch file ownership để hạn chế sửa cùng file, không phải xác nhận các tính năng đã hoàn thành.

### File/thư mục cụ thể theo thành viên

Các đầu việc B07, B15–B21 vẫn thuộc C như đã phân công trong hướng dẫn. Bảng dưới đây chỉ cụ thể hóa quyền sở hữu file; các mục ghi “mới” là file/thư mục có thể tạo khi triển khai.

| Người chịu trách nhiệm | File/thư mục phụ trách |
| --- | --- |
| **A — Sơn** | `src/models/**`; `src/services/api/**`; `src/store/**` (mới); `src/utils/constants.ts`; `src/controllers/useAuthController.ts` (xử lý B09–B10); `.github/**`; `package.json` và `package-lock.json` khi cần dependency. Unit test của model/API đặt cạnh module tương ứng, ví dụ `src/services/api/*.test.ts`. |
| **B — Phúc** | `src/views/components/**` (gồm `ItemCard.tsx`, `ExpandableItemCard.tsx`, và `ItemForm.tsx` mới); `assets/**`; `tamagui.config.ts`; giao diện các screen `src/views/screens/LoginScreen.tsx`, `src/views/screens/ItemDetailScreen.tsx`, `src/views/screens/ItemReportScreen.tsx`; component animation hồ sơ `src/views/components/ProfileAnimation.tsx` (mới). Tập trung UI/theme/animation; không sửa route. |
| **C — Phú** | Toàn bộ `src/app/**` (route/layout); `src/controllers/useItemController.ts` và `src/controllers/useProfileController.ts` (mới); `src/controllers/useItemReportController.ts` và `src/controllers/useReportModerationController.ts`; `src/views/screens/ExploreScreen.tsx`; `src/views/screens/MyItemsScreen.tsx` và `src/views/screens/ProfileScreen.tsx` (mới); `src/views/screens/ReportModerationScreen.tsx`. C phụ trách kết nối UI với controller và các luồng B07, B15–B21; dùng component form/animation do B cung cấp. |
| **D — Tú** | `src/services/device/**` (mới); `src/services/appointments/**` (mới); `src/controllers/useAppointmentController.ts` (mới); `src/views/screens/AppointmentsScreen.tsx` (mới); `eas.json` (mới); test QA/tích hợp trong `src/__tests__/**` (mới). Dùng `Appointment` hiện có tại `src/models/appointmentModel.ts`, không tạo model trùng. |

### Ranh giới file để tránh conflict

- Một file chỉ có một người chịu trách nhiệm chính. `src/app/**` do C quản lý; A, B, D không sửa route mà cung cấp controller/service/screen để C tích hợp.
- `src/models/**`, `src/services/api/**` và `src/store/**` do A quản lý. Khi tính năng của người khác cần API hoặc model mới, thống nhất interface với A trước; A sửa phần dùng chung.
- Screen được chia theo file ở bảng trên: B làm component/UI dùng lại và các screen UI được giao; C làm Explore, “Của tôi”, hồ sơ và tích hợp route; D làm màn hình lịch hẹn. Không cùng sửa một screen trong cùng thời gian.
- A sở hữu unit test đặt cạnh model/API; D sở hữu test QA/tích hợp trong `src/__tests__/**`. Nếu cần test component/screen, chủ file screen phối hợp với D để phân định file test trước khi tạo.
- Luồng report/moderation của PR #4 đã có bản demo; giữ nguyên các file hiện có, chỉ sửa khi có yêu cầu cụ thể và người sở hữu file thực hiện.
- Mỗi PR chỉ gồm một nhóm file thuộc phạm vi của người làm. Nếu cần sửa file do thành viên khác sở hữu, yêu cầu người đó thực hiện hoặc thống nhất trước khi chia PR.
- Tạo nhánh tính năng từ `main`, cập nhật `main` trước khi mở PR; chạy lint, typecheck và Jest. Thay đổi dependency/CI cần phối hợp với A; không để nhiều người đồng thời sửa manifest/lockfile.

## Checkpoint khởi tạo — 22/10/2026

**Mốc đối chiếu:** nhánh `main` tại commit `b64435e802aaceba1bc8007e4865c14f516b14b4` ngày 22/10/2026.

**Lưu ý nhánh:** repository hiện dùng `main` làm nhánh tích hợp; tài liệu dùng “nhánh đích” để chỉ `main`, không giả định có nhánh `master` hoặc `develop`.

**Mục tiêu sprint:** Chưa có số sprint và khoảng ngày bắt đầu/kết thúc được cung cấp; đây là checkpoint khởi tạo dựa trên trạng thái GitHub hiện tại, không gán vào một sprint chưa xác minh.

| Hạng mục | Phụ trách | Trạng thái hiện tại | Kết quả/bằng chứng | Còn thiếu hoặc bước tiếp theo |
| --- | --- | --- | --- | --- |
| Báo cáo vi phạm và moderation demo | `ThaiSon23641341` | Đã merge | PR #4 đã merge vào `main`; 11 test service, TypeScript và ESLint đều đạt | Demo UI trên app; bổ sung backend, xác thực và phân quyền moderator trước production |
| Đăng nhập | `lmphuc1701` | Bị chặn | PR #3 còn mở; GitHub báo trạng thái mergeable `dirty` | Đồng bộ với `main`, giải quyết xung đột, chạy kiểm tra và cập nhật PR |
| Tạo/chỉnh sửa món đồ qua giao diện | Chưa xác định | Đang làm | Có mock CRUD trong item service; các route tạo/sửa hiện là màn hình placeholder | Nối giao diện với service và bổ sung test luồng chính |
| Khám phá/danh sách và chi tiết món đồ | Chưa xác định | Đang làm | Có dữ liệu mock và điều hướng mẫu; màn hình khám phá/chi tiết chưa hiển thị luồng danh sách/chi tiết đầy đủ | Hoàn thiện UI, nối dữ liệu và kiểm thử trên app |
| Lịch hẹn, hồ sơ và “Của tôi” | Chưa xác định | Chưa bắt đầu | Các tab hiện đang là placeholder | Xác nhận người phụ trách và phạm vi; triển khai luồng, validation và test |

**Vấn đề/rủi ro đang theo dõi:**

- PR #3 bị GitHub báo có xung đột với nhánh đích; cần xử lý trước khi merge.
- Báo cáo và moderation hiện chỉ lưu dữ liệu trong bộ nhớ của tiến trình; không có backend hoặc phân quyền.
- PR #5 là PR tạm để kiểm tra quy tắc review, không phải tính năng dự án. GitHub đang báo `REVIEW_REQUIRED`; đóng PR này sau khi kiểm tra và không merge file thử vào `main`.
- Chưa có bằng chứng demo thủ công trên thiết bị hoặc emulator tại checkpoint này.

**Kết luận checkpoint:** Chưa chốt kết quả sprint vì chưa có thông tin sprint. Tính năng báo cáo đã merge và kiểm tra tự động đạt; chưa đủ bằng chứng nghiệm thu UI/phân quyền để đánh dấu hoàn thành. PR đăng nhập còn bị chặn do xung đột.

**Mục tiêu tiếp theo:** Giải quyết xung đột PR #3; demo luồng báo cáo trên app; xác nhận người phụ trách và tiêu chí hoàn thành cho các use case còn placeholder; bổ sung test tương ứng trước checkpoint sprint tiếp theo.

## Mẫu checkpoint sprint mới

Sao chép khối dưới đây và đặt phía trên checkpoint cũ:

```md
### Sprint N — DD/MM/YYYY đến DD/MM/YYYY

**Mốc đối chiếu:** `main` tại commit `<commit>` ngày DD/MM/YYYY.

**Mục tiêu sprint:**

| Hạng mục | Phụ trách | Trạng thái hiện tại | Kết quả/bằng chứng | Còn thiếu hoặc bước tiếp theo |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... |

**Vấn đề/rủi ro đang theo dõi:**

- ...

**Kết luận sprint:** Đạt/Chưa đạt mục tiêu vì ...

**Mục tiêu sprint tiếp theo:** ...
```