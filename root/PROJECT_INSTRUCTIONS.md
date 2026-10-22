# Hướng dẫn dự án

## 1. Mục tiêu và công nghệ

- **Tên đề tài:** Ứng dụng mạng trao đổi đồ dùng trong trường sinh viên.
- **Nền tảng:** React Native, Expo SDK 55, TypeScript.
- **Kiến trúc:** MVC, điều hướng bằng Expo Router.
- **Giao diện:** Tamagui, hỗ trợ theme sáng/tối.
- **Kiểm thử:** Jest, `jest-expo` và React Native Testing Library.
- **Các tích hợp dự kiến:** Redux Toolkit, Camera, Notifications, Reanimated,
  Gesture Handler, API/backend và EAS Build.

Ứng dụng phục vụ sinh viên đăng, tìm và trao đổi/tặng đồ dùng học tập. Dữ liệu
API trong giai đoạn hiện tại có thể dùng mock; cần ghi rõ khi một tính năng chưa
nối backend thật.

## 2. Cấu trúc và nguyên tắc MVC

Mã ứng dụng nằm trong `Nhom18_ITEM_EXCHANGE_NETWORK/src/`:

| Thư mục | Trách nhiệm |
| --- | --- |
| `models/` | Interface, type, DTO và schema; không chứa UI hoặc React hooks. |
| `controllers/` | Custom hooks điều phối state, validation, service và luồng dữ liệu. |
| `views/components/` | Component giao diện dùng lại, ưu tiên Tamagui và accessibility. |
| `views/screens/` | Màn hình; nhận dữ liệu và handlers từ controller/service. |
| `app/` | Expo Router routes và layout; route nên mỏng, không chứa nghiệp vụ. |
| `services/` | API, mock API, backend và wrapper cho các Expo SDK. |
| `store/` | Redux Toolkit slices, store và typed hooks khi được tích hợp. |
| `utils/` | Hằng số và hàm tiện ích không phụ thuộc UI. |
| `**/*.test.ts(x)` | Unit/integration tests đặt gần module được kiểm thử. |

View không gọi API trực tiếp nếu nghiệp vụ cần phối hợp; hãy đặt logic ở
controller/service. Mỗi luồng dữ liệu cần xử lý rõ **Loading, Success, Error và
Empty**.

## 3. Quy tắc tên và mã nguồn

- Component, screen, type và interface: `PascalCase`.
- File component/screen: `PascalCase.tsx`.
- Hook/controller: `useCamelCase.ts`.
- Model, service và utility: `camelCase.ts`.
- Hằng số: `UPPER_SNAKE_CASE`.
- Giữ TypeScript strict, ưu tiên type/guard thay vì ép kiểu không an toàn.
- Giao diện phải dùng được trên iOS, Android và web; có nhãn accessibility phù
  hợp cho điều khiển tương tác.
- Không thêm API key, credentials hoặc dữ liệu nhạy cảm vào mã nguồn. Dùng biến
  môi trường và cung cấp `.env.example` nếu tính năng cần cấu hình.

## 4. Quy trình Git và bảo vệ tài liệu

### Nhánh và pull request

- `main`: bản ổn định; `develop`: nhánh tích hợp.
- Tạo nhánh `feature/<mã-thành-viên>-<tên-chức-năng>` từ `develop`.
- Không commit/push trực tiếp lên `main` hoặc `develop`.
- Mọi thay đổi được gửi qua pull request vào `develop`.
- PR chỉ được merge sau khi CI thành công và có ít nhất một người review
  approve; bật yêu cầu review của CODEOWNERS cho các file được bảo vệ.
- Dùng Conventional Commits, ví dụ `feat: add item report flow`.

### File hướng dẫn được bảo vệ

`root/PROJECT_INSTRUCTIONS.md` là tài liệu chuẩn của nhóm. Thành viên không tự
ý sửa, xóa hoặc di chuyển file này. Nếu cần cập nhật, hãy đề xuất nội dung qua
issue/PR và chỉ maintainer **@ThaiSon23641341** được duyệt, cập nhật tài liệu.

`/.github/CODEOWNERS` đã gán file này cho maintainer. Để GitHub thực sự chặn
merge khi chưa có maintainer review, quản trị viên repository phải bật ruleset
hoặc branch protection cho nhánh đích với:

1. Yêu cầu pull request trước khi merge.
2. Yêu cầu review từ Code Owners.
3. Không cho phép bypass quy tắc hoặc push trực tiếp, trừ tài khoản quản trị
   được ủy quyền rõ ràng.

CODEOWNERS không tự ngăn người có quyền ghi sửa file trong commit cục bộ; việc
thực thi bắt buộc phụ thuộc branch protection/ruleset trên GitHub.

## 5. Phân công thành viên

### Thành viên A — Sơn: Project Manager, Backend/AI

**Phạm vi:** `src/store/`, `src/services/api/`, `src/models/`, `.github/`.

- **B01:** Khởi tạo repository, workflow và quy trình làm việc nhóm.
- **B02:** Thiết lập cơ sở dữ liệu thử nghiệm bằng Supabase/JSON Server.
- **B03:** Quản lý dữ liệu dùng chung bằng Redux Toolkit.
- **B09–B10:** Đăng nhập email trường `@student.iuh.edu.vn` và đăng xuất.
- **B33:** Chặn từ khóa không cho phép trong nội dung bài đăng.
- **B34:** Quản lý trạng thái đồ dùng: còn, đang giữ, đã trao.
- **B35:** Ẩn số điện thoại khi hiển thị hồ sơ công khai.
- **B39–B40:** Hoàn thiện báo cáo; sửa lỗi và tối ưu hiệu năng.

### Thành viên B — Phúc: Frontend UI/UX, Animation

**Phạm vi:** `src/views/components/`, theme và assets.

- **B04–B05:** Thiết kế Figma; Tamagui tokens và theme sáng/tối.
- **B08:** Giao diện đăng nhập email trường.
- **B11:** Animation cho màn hình tài khoản.
- **B12:** Giao diện đăng bài.
- **B22–B23:** Giao diện chi tiết đồ dùng; mở rộng/cử chỉ với Reanimated và
  Gesture Handler.
- **B31:** Giao diện báo cáo bài đăng vi phạm.
- **B32:** Lưu ý an toàn và gợi ý điểm hẹn công cộng.

### Thành viên C — Phú: Luồng ứng dụng và điều hướng

**Phạm vi:** `src/views/screens/`, `src/app/`, `src/controllers/`.

- **B07:** Expo Router Stack/Tab navigation.
- **B15:** Form nhập tên, mô tả, danh mục và tình trạng đồ dùng.
- **B16–B18:** Danh sách đồ dùng cá nhân, chỉnh sửa và xóa bài.
- **B19:** Danh sách bằng FlatList có phân trang/lazy load.
- **B20–B21:** Tìm kiếm từ khóa; lọc theo danh mục và tình trạng.

### Thành viên D — Tú: Tích hợp thiết bị và QA

**Phạm vi:** `src/services/device/`, tests và `eas.json`.

- **B06:** Khởi tạo dự án Expo TypeScript.
- **B13–B14:** Chụp ảnh bằng Camera và chọn ảnh từ thư viện.
- **B24:** Tạo/chia sẻ deep link đến món đồ.
- **B25–B29:** Tạo, chọn ngày giờ, xác nhận, xem và hủy lịch nhận đồ.
- **B30:** Thông báo nhắc lịch trên thiết bị.
- **B36–B37:** Tối thiểu 8 ca kiểm thử chức năng; khảo sát tối thiểu 5 sinh viên.
- **B38:** Cấu hình và thực hiện EAS Build.

Phạm vi trên mô tả trách nhiệm dự kiến; thay đổi cần được thống nhất qua PR,
không dùng phân công để bỏ qua review hoặc tiêu chuẩn chất lượng.

## 6. Kiểm thử và CI

Trong thư mục dự án `Nhom18_ITEM_EXCHANGE_NETWORK/`, cài dependencies bằng
`npm ci`, sau đó chạy:

```bash
npm run lint
npx tsc --noEmit
npm test -- --ci
```

Jest dùng preset `jest-expo`; đặt test gần mã nguồn với hậu tố `.test.ts` hoặc
`.test.tsx`. Test cần bao phủ hành vi thành công, dữ liệu biên và lỗi có thể xảy
ra. CI tại `.github/workflows/ci.yml` phải cài dependencies, chạy typecheck,
lint và Jest trên pull request/push vào `main` hoặc `develop`.

Tiêu chí chất lượng:

- `npx tsc --noEmit`, lint và toàn bộ test phải pass trước khi merge.
- Đáp ứng ít nhất 8 ca kiểm thử chức năng và lưu kết quả Pass/Fail.
- Không coi mock hoặc test unit là bằng chứng cho tích hợp backend/thiết bị thật.
- Mọi chức năng dữ liệu cần hiển thị trạng thái tải, thành công, lỗi và rỗng.

## 7. Mục tiêu học phần và tích hợp

Theo kế hoạch môn học, dự án hướng tới ba luồng nghiệp vụ chính, tối thiểu sáu
màn hình, danh sách FlatList phân trang, custom hooks, Stack/Tab, deep linking,
Redux Toolkit, Camera và Notifications, Reanimated/Gesture Handler, Tamagui,
AI có kiểm soát bảo mật, EAS Build và CI/CD.

Chỉ đánh dấu một mục hoàn thành khi có triển khai và kiểm chứng phù hợp. Tích
hợp AI/backend/thiết bị cần kiểm tra quyền truy cập, dữ liệu đầu vào, lỗi mạng,
quyền riêng tư và không để lộ bí mật trong client.
