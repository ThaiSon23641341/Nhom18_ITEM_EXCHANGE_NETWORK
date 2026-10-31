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
| 31/10/2026 | Phúc | Giao diện và luồng bài đăng món đồ | Đưa giao diện khám phá, thẻ sản phẩm, chi tiết món đồ, tạo/chỉnh sửa bài đăng và điều hướng liên quan vào nhánh test; bổ sung/cập nhật model và item service. Đăng nhập vẫn là demo email, chưa xác thực với backend | Đã merge | Branch `phuc23636991`, merge commit `35ecce6` | Được kiểm thử lại cùng trạng thái cuối nhánh: app Jest 50/50 đạt, TypeScript đạt | Chạy demo các màn hình và rà soát luồng tạo/chỉnh sửa; kết nối xác thực và backend thật vẫn chưa có |
| 31/10/2026 | Tú | Lịch hẹn, thiết bị và cấu hình Expo | Đưa luồng tạo/xác nhận lịch hẹn, dịch vụ lịch hẹn, chọn ảnh bằng camera/thư viện, chia sẻ, thông báo và cấu hình EAS/Expo SDK 58 vào nhánh test; cập nhật backend demo/CI tương thích | Đã merge | Branch `Tú`, commit nguồn `29aed4a`, merge commit `d0a255c` | App Jest 50/50 đạt; backend build và 9/9 API tests đạt; Expo Doctor 20/20 đạt | Chạy thử trên thiết bị thật; thông báo/push token trên Web chưa được hỗ trợ đầy đủ. Dịch vụ vẫn dùng dữ liệu demo trong bộ nhớ |
| 31/10/2026 | Phú | Khám phá, lọc và quản lý bài đăng | Đưa tìm kiếm, lọc danh mục/tình trạng, phân trang, màn hình “Của tôi”, luồng tạo/chỉnh sửa dùng chung, kiểm tra quyền sở hữu và hỗ trợ giá/địa điểm/tối đa 5 ảnh vào nhánh test; sửa lỗi thử tải thêm sau thất bại và thêm test hồi quy | Đã merge | Branch `Phú`, commit nguồn `371b819`, merge commit `6e37c5f` | Test phân trang có hồi quy; toàn bộ app Jest 50/50 đạt và TypeScript đạt | Nghiệm thu thủ công các bộ lọc, phân trang, tạo/sửa/xóa và quyền chủ sở hữu trên Web/điện thoại |
| 31/10/2026 | `ThaiSon23641341` | Hợp nhất và kiểm tra nhánh test | Hợp nhất lần lượt phần Phúc, Tú và Phú; giữ Expo SDK 58, dịch vụ demo, luồng lịch hẹn/chia sẻ và backend CI; xử lý xung đột và giữ một route chỉnh sửa bài đăng | Đã merge | `test/review-rules-20261022`, HEAD `6e37c5f` (chưa push; ahead origin 26 commits tại thời điểm ghi) | App Jest 50/50; backend 9/9; TypeScript đạt; lint không lỗi (còn 1 cảnh báo từ `.expo/types/router.d.ts`); Expo Doctor 20/20; web export thành công | Hoàn tất nghiệm thu giao diện/luồng trên thiết bị; backend, đăng nhập và lưu ảnh hiện chưa kết nối hệ thống production |
| 31/10/2026 | `ThaiSon23641341` | Sửa accessibility và back navigation trên Web | Chuyển accessibility props sang ARIA trên Web/native props trên iOS/Android; thêm `goBackOrReplace` để trang mở trực tiếp có route dự phòng thay vì dispatch `GO_BACK` không xử lý được | Đang làm | Working tree của `test/review-rules-20261022`, chuẩn bị commit/merge | 56/56 app Jest; 5/5 server tests; TypeScript, lint và Expo Web export đạt. Mở trực tiếp `/item/item-018`, trang render, nút quay lại điều hướng về `/` mà không tái hiện `GO_BACK`; chỉ còn cảnh báo giới hạn `expo-notifications` trên Web | Chờ commit và merge lên `main`; cần tiếp tục nghiệm thu các luồng chính trên thiết bị thật |
| 31/10/2026 | `ThaiSon23641341` | Kiểm tra tích hợp JSON Server và tài khoản đặt lịch demo | Thêm tài khoản giả `21036011.test@student.iuh.edu.vn` (`user-011`) vào seed để kiểm thử đặt món của tài khoản khác; JSON Server chạy ở cổng 3001 và health endpoint trả `ok` | Đang làm | `test/review-rules-20261022`, chưa commit/merge | Tra cứu account API thành công; `item-001` còn hàng và thuộc user khác; 5/5 server tests đạt | Chờ commit và merge; đây là đăng nhập demo không mật khẩu, chỉ dùng dữ liệu giả |
| 31/10/2026 | `ThaiSon23641341` — rà soát phần A (Sơn) | Backend, dữ liệu và xác thực | Backend demo có model/API, dữ liệu in-memory; có kiểm tra từ khóa cấm, trạng thái món và public profile chỉ trả dữ liệu không gồm số điện thoại. Ứng dụng vẫn dùng mock services và đăng nhập trong bộ nhớ | Đã merge (demo) | Nhánh test, HEAD `6e37c5f` | Backend build và 9/9 tests đạt; các test này không chứng minh kết nối database hoặc app-backend | **Còn thiếu:** B02 kết nối DB thật (Supabase/JSON Server); B03 Redux store; B09–B10 xác thực backend và hoàn thiện trải nghiệm đăng xuất; tích hợp app với API để áp dụng B33–B35 ngoài demo backend. Chưa có số liệu benchmark/kiểm thử hiệu năng B39–B40; cần kiểm tra cấu hình branch protection trên GitHub |
| 31/10/2026 | `ThaiSon23641341` — triển khai phần A (demo JSON Server) | JSON Server, app API integration và Redux auth state | Thêm server riêng dùng `server/db.json`; nối item/report/demo-profile service và email demo vào REST API; thêm Redux store cho phiên app. Seed có profile cho toàn bộ chủ bài đăng; README ghi rõ cách chạy, URL emulator/device và giới hạn bảo mật | Đang làm | `test/review-rules-20261022`, thay đổi trong working tree; chưa commit | App Jest 54/54; server integration tests 5/5; `npx tsc --noEmit`, `npm run lint`, `git diff --check` đạt | Đây chỉ là backend file-based để test; không có mật khẩu, xác minh email, phân quyền moderator/ownership hoặc lưu ảnh; appointment vẫn in-memory. Cần demo app trên Web/điện thoại và hoàn tất QA trước khi ghi nhận nghiệm thu |
| 31/10/2026 | `ThaiSon23641341` — rà soát phần B (Phúc) | UI/UX, thiết kế và animation | Đã có giao diện đăng nhập, đăng bài, chi tiết, báo cáo, theme Tamagui và ghi chú hẹn ở nơi công cộng. Có `ExpandableItemCard` dùng Reanimated | Đã merge (một phần) | Nhánh test, merge commit `35ecce6` | TypeScript và app Jest đạt; chưa có bằng chứng nghiệm thu UI trên thiết bị | **Còn thiếu/cần xác minh:** B11 màn tài khoản vẫn là `PlaceholderScreen`, chưa thấy animation hồ sơ; B23 component mở rộng bằng Reanimated chưa được screen nào sử dụng và chưa có gesture trong luồng chi tiết. Theo phân công Giai đoạn 3, Phúc nhận phần hồ sơ; B04/Figma không còn là đầu việc. Cần chạy thử giao diện trên iOS/Android/Web |
| 31/10/2026 | `ThaiSon23641341` — rà soát phần D (Tú) | Thiết bị, lịch hẹn và QA | Đã có chọn ảnh, chia sẻ URL với scheme `nhom18item`, tạo/xác nhận/xem lịch hẹn và đặt nhắc lịch trên native | Đã merge (demo) | Nhánh test, merge commit `d0a255c` | Có unit tests cho service ảnh/thông báo/lịch hẹn; chưa có checklist test chức năng Pass/Fail hoặc biên bản khảo sát | **Còn thiếu/cần xác minh:** B29 chưa có nút/luồng hủy lịch ở app; backend có API đổi trạng thái nhưng app dùng appointment store in-memory riêng, chưa tích hợp API. Chưa xác minh deep link mở đúng màn khi chia sẻ ngoài app; chưa chạy thử camera/thông báo trên thiết bị thật. B36–B37 cần ít nhất 8 ca kiểm thử chức năng có kết quả và khảo sát 5 sinh viên; B38 mới có `eas.json`, chưa có bằng chứng EAS build |
| 31/10/2026 | `ThaiSon23641341` — rà soát phần C (Phú) | Điều hướng và quản lý bài đăng | Đã có route, form và CRUD bài của tôi, tìm kiếm/lọc, phân trang/lazy load, trạng thái Loading/Error/Empty, kiểm tra chủ sở hữu; form giữ giá, địa điểm và tối đa 5 ảnh | Đã merge | Nhánh test, merge commit `6e37c5f` | App Jest 50/50 và TypeScript đạt; có test hồi quy retry phân trang | **Còn thiếu:** nghiệm thu thủ công các ca tạo/sửa/xóa, chặn sửa bài người khác/đã trao, lọc và retry phân trang trên Web/điện thoại. Hồ sơ người dùng vẫn là placeholder; phân công đang chưa thống nhất giữa tài liệu và comment route (Phú trong bảng ownership, A trong route). Cần chốt người phụ trách trước khi hoàn thiện |
| 31/10/2026 | Nhóm — việc tích hợp chung | Kiểm thử liên nền tảng và kết nối demo | Toàn bộ test tự động hiện đạt ở lần chạy gần nhất, nhưng phần lớn là unit tests; backend demo chưa nối app và dữ liệu app lưu trong bộ nhớ | Đang làm | Nhánh `test/review-rules-20261022` | 50 app tests và 9 backend tests đạt; chưa có bằng chứng test E2E/thủ công theo checklist | Lập checklist nghiệm thu tối thiểu 8 ca chức năng; kiểm tra Web/iOS/Android; rà soát accessibility trên các màn khác (một số vẫn truyền `accessibilityRole`/`accessibilityLabel` native); không coi unit test là bằng chứng tích hợp production |

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

## Giai đoạn 3 — hoàn thiện, nghiệm thu và phân quyền file

**Mốc:** 31/10/2026. **Nhánh làm việc:** `test/review-rules-20261022`, HEAD `6e37c5f` tại thời điểm lập kế hoạch. Bảng dưới đây thay thế phân công file ở Giai đoạn 2 cho các công việc còn lại; không sửa `root/PROJECT_INSTRUCTIONS.md`. Một file chỉ có một người sửa chính. Các thay đổi accessibility đang có trong working tree được tính là việc đang dở, không phải phần đã merge.

### Phân công công việc còn lại

| Người phụ trách | Việc còn lại | File được phép sửa trong Giai đoạn 3 | Bàn giao/kiểm chứng |
| --- | --- | --- | --- |
| **A — Sơn** | Chốt phương án lưu trữ và nối backend với app; hoàn thiện xác thực/đăng xuất thật; giữ kiểm tra nội dung, trạng thái món và public profile không lộ điện thoại ở phía server. B03 Redux chỉ triển khai nếu vẫn là yêu cầu của nhóm sau khi chốt kiến trúc. Chạy rà soát bảo mật/hiệu năng và kiểm tra branch protection. | Backend: `backend/src/app.ts`, `backend/src/demoStore.ts`, `backend/src/models.ts`, `backend/src/seedData.ts`, `backend/test/app.test.mts`; app: `src/models/userModel.ts`, `src/models/itemModel.ts`, `src/services/api/itemService.ts`, `src/services/api/reportService.ts`, `src/services/authService.ts`, `src/controllers/useAuthController.ts`, `src/controllers/useAuthController.test.ts`, `src/store/**` (chỉ nếu Redux được xác nhận), `.github/workflows/ci.yml` và `package.json`/lockfile khi cần. **Không sửa** `src/services/api/appointmentService.ts` (Tú sở hữu). | Ghi lựa chọn DB/mock và các giới hạn bảo mật; xác minh luồng đăng nhập/đăng xuất, CRUD qua API và kiểm thử backend. Unit test không được ghi nhận là bằng chứng app đã tích hợp production. |
| **B — Phúc** | Hoàn thiện UI hồ sơ thay placeholder; thêm animation hồ sơ; dùng component Reanimated mở rộng trong luồng chi tiết và kiểm tra tương tác/motion. Rà soát accessibility trên các màn hình/component do B sở hữu. **Không cần link hoặc file Figma** theo quyết định của nhóm. | `src/views/screens/ProfileScreen.tsx` (mới), `src/app/(tabs)/profile.tsx`, `src/views/components/ProfileAnimation.tsx` (mới), `src/views/components/AppHeader.tsx`, `src/views/components/ProductCard.tsx`, `src/views/components/ExpandableItemCard.tsx`, `src/views/screens/ItemDetailScreen.tsx`, `src/views/screens/LoginScreen.tsx`, `src/views/screens/ItemReportScreen.tsx`, `src/views/components/ItemCard.tsx`, `src/views/components/ConfirmDialog.tsx`. | Ghi nhận B04/Figma là **không còn là đầu việc**; demo hồ sơ/chi tiết và xác nhận nhãn accessibility trên Web/iOS/Android. Phần xác thực nghiệp vụ thuộc Sơn; không sửa controller/service auth. |
| **C — Phú** | Nghiệm thu CRUD món đồ, kiểm tra quyền sở hữu, tìm kiếm/lọc, phân trang và các trạng thái loading/error/empty; sửa lỗi được xác nhận trong các luồng này. Hoàn tất props accessibility của tab layout và các màn danh sách/form. | `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/my-items.tsx`, `src/app/(tabs)/create.tsx`, `src/app/explore.tsx`, `src/app/item/create.tsx`, `src/app/item/[id]/edit.tsx`, `src/app/(tabs)/item/[id]/index.tsx`, `src/app/(tabs)/item/_layout.tsx`; `src/controllers/useItemController.ts`, `src/controllers/useExploreController.ts`, `src/controllers/useItemDetailController.ts`, `src/controllers/useItemFormController.ts`, `src/controllers/useMyItemsController.ts`, `src/controllers/usePaginatedItems.ts`, `src/controllers/usePaginatedItems.test.ts`, `src/controllers/useItemFormController.test.ts` (mới), `src/views/screens/ExploreScreen.tsx`, `src/views/screens/MyItemsScreen.tsx`, `src/views/screens/ItemFormScreen.tsx`, `src/views/screens/ItemFilterBar.tsx`, `src/views/screens/ItemListRow.tsx`, `src/views/screens/ListStateView.tsx`, `src/utils/itemFilters.ts`, `src/utils/itemFilters.test.ts`, `src/utils/validateItem.ts`, `src/utils/validateItem.test.ts`. **Không sửa** màn profile hoặc `src/views/screens/ItemDetailScreen.tsx` (Phúc sở hữu UI); phối hợp với Phúc nếu cần thay đổi đồng thời phần route chi tiết và screen. | Chạy checklist quyền chủ sở hữu (đúng chủ, người khác, bài đang giữ/đã trao), lọc/phân trang/retry và tạo/sửa/xóa. Báo lỗi kèm bước tái hiện; không sửa API/model do Sơn sở hữu. |
| **D — Tú** | Hoàn thiện hủy lịch hẹn phía app; thống nhất hợp đồng API lịch hẹn với Sơn trước khi nối client; kiểm tra đặt/cancel/reminder, camera, chọn ảnh và chia sẻ deep link trên thiết bị. Thực hiện tối thiểu 8 ca kiểm thử chức năng có kết quả Pass/Fail, khảo sát tối thiểu 5 sinh viên (chỉ lưu tổng hợp ẩn danh), và tạo bằng chứng EAS build. | `src/services/api/appointmentService.ts`, `src/services/api/appointmentService.test.ts`, `src/services/appointments/appointmentService.ts`, `src/services/appointments/index.ts`, `src/controllers/useAppointmentController.ts`, `src/controllers/useAppointmentsController.ts`, `src/views/screens/AppointmentsScreen.tsx`, `src/views/screens/BookAppointmentScreen.tsx`, `src/app/(tabs)/appointments.tsx`, `src/app/appointment/create.tsx`, `src/app/appointment/confirm.tsx`, `src/app/(tabs)/item/[id]/book.tsx`, `src/services/device/imagePickerService.ts`, `src/services/device/notificationService.ts`, `src/services/device/index.ts`, `src/services/shareService.ts`, `src/__tests__/appointmentService.test.ts`, `src/__tests__/notificationService.test.ts`, `eas.json`, `root/PHASE3_QA_CHECKLIST.md` (mới). | Checklist phải ghi thiết bị/nền tảng, bước thử và kết quả; khảo sát không lưu tên/email/số điện thoại; ghi rõ EAS build thành công/thất bại. Backend route/model/test thuộc Sơn, nên mọi thay đổi API server do Sơn thực hiện theo hợp đồng đã thống nhất. |
| **Điều phối nhật ký — Sơn** | Cập nhật trạng thái và commit/PR sau khi nhận kết quả từng người; không sửa file code đang thuộc người khác. | Chỉ `root/PROJECT_PROGRESS.md`. | Mỗi cập nhật phân biệt đã triển khai, đã test tự động, đã nghiệm thu thủ công và còn phụ thuộc; không ghi hoàn thành chỉ dựa vào unit tests. |

### Ranh giới phối hợp và trình tự

1. Sơn và Tú thống nhất trước endpoint/DTO và trạng thái hẹn; Sơn chỉ sửa backend, Tú chỉ sửa client appointment. Không cùng sửa một file.
2. Sơn chốt DB và cách xác thực trước khi thay mock client; nếu chưa chốt được, tiếp tục ghi rõ là demo in-memory, không tạo cấu hình giả.
3. Phúc sở hữu UI của profile và item detail; Phú sở hữu controller/list/form và route danh sách. Với trang chi tiết, route/controller do Phú quản lý, screen/component UI do Phúc quản lý.
4. Phú sở hữu `src/app/(tabs)/_layout.tsx` và `src/views/screens/ItemFilterBar.tsx` đang có thay đổi accessibility chưa commit; Phúc không sửa hai file này. Phúc sở hữu `AppHeader.tsx` và `ProductCard.tsx`.
5. Tú tạo checklist tại `root/PHASE3_QA_CHECKLIST.md`; các thành viên chỉ báo kết quả/phát hiện, Sơn là người cập nhật nhật ký này để tránh nhiều người sửa cùng tài liệu.
6. File không có trong danh sách của một người không tự động thuộc quyền sửa của người đó. Cần yêu cầu chủ file cập nhật hoặc thống nhất bàn giao trước; dependency/lockfile chỉ Sơn sửa.

### Trạng thái Giai đoạn 3

| Hạng mục | Trạng thái | Bằng chứng hiện có | Điều kiện hoàn tất |
| --- | --- | --- | --- |
| Phân lại quyền sở hữu file, tránh conflict | Đang làm | Bảng phân công và ranh giới ở trên; working tree hiện còn các file accessibility chưa commit | Các thành viên xác nhận nhận việc; không có hai người sửa cùng file |
| Backend, database, auth và app integration (Sơn) | Đang làm (demo) | JSON Server trong `server/`; API client và item/report/demo-profile services trong `src/services/`; Redux auth state trong `src/store/`; 54 app tests và 5 server tests đạt | Demo app với server trên Web/emulator/thiết bị; B02 chỉ dùng file JSON, B09–B10 chưa xác thực email/mật khẩu hoặc phân quyền; lịch hẹn và ảnh vẫn chưa lưu server |
| Profile, animation và UI accessibility thuộc Phúc | Chưa bắt đầu trong Giai đoạn 3 | Route profile hiện dùng `PlaceholderScreen`; `ExpandableItemCard` đã có animation nhưng chưa được tích hợp vào luồng chi tiết | Màn profile/chi tiết chạy được, accessibility phù hợp đa nền tảng và có nghiệm thu |
| Nghiệm thu item flow và accessibility danh sách/form (Phú) | Đang làm | Có 50 app tests đạt ở checkpoint trước; accessibility patch tại `_layout.tsx` và `ItemFilterBar.tsx` còn chưa commit | Hoàn tất test quyền, CRUD, lọc/phân trang và kiểm tra trên nền tảng mục tiêu |
| Lịch hẹn, thiết bị, QA và EAS (Tú) | Đang làm | Có service/test demo; chưa có checklist 8 ca, khảo sát tổng hợp hoặc bằng chứng EAS build; app chưa có nút hủy lịch | API contract được thống nhất; kiểm thử chức năng có kết quả, khảo sát ẩn danh và build được ghi lại |
| Ghi nhận QA chung | Chưa bắt đầu | Chưa có file checklist kết quả thủ công trong repository | `root/PHASE3_QA_CHECKLIST.md` có tối thiểu 8 ca Pass/Fail cùng nền tảng/thiết bị và phát hiện còn mở |

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