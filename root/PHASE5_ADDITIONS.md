# Giai đoạn 5 - Yêu cầu bổ sung

Ngày ghi: 05/11/2026. Người đề xuất: Sơn.

## 1. Trang chủ không hiện vật phẩm đã trao
- Trang Khám phá (Explore) chỉ hiển thị món đồ có `status = available`.
- Món `exchanged` (và nên cả `reserved`) không xuất hiện trong danh sách trang chủ.
- Chủ món đồ vẫn xem được trong "Đồ của tôi" và lịch sử.
- Phụ trách: Phú (`server/routes/items.cjs`, `ExploreScreen`, controller liên quan).
- Kiểm thử: danh sách trang chủ không chứa món `exchanged`.

## 2. Khóa chỉnh sửa khi hai bên đã xác nhận
- Khi lịch hẹn ở trạng thái "hai người đã xác nhận" thì không cho sửa hoặc xóa món đồ, và không cho sửa lịch hẹn. Chỉ còn hủy hoặc hoàn thành.
- Hiện lịch hẹn chỉ có một trạng thái `confirmed`. Cần thống nhất cách ghi nhận hai bên: ví dụ lưu `confirmedBy: [requesterId, ownerId]` và coi là "đã xác nhận cả hai" khi đủ hai người.
- Server từ chối thao tác sửa bằng 409, giao diện ẩn hoặc vô hiệu nút sửa.
- Phụ trách: Tú (trạng thái lịch hẹn, `server/routes/appointments.cjs`), Phú (chặn sửa món đồ trong `server/routes/items.cjs`, `itemPermissions`).
- Kiểm thử: sửa món đồ đã khóa trả 409; sửa lịch hẹn đã đủ hai xác nhận trả 409.

## 3. Chat giữa hai người sau khi xác nhận hẹn
- Chat chỉ mở khi lịch hẹn đã được cả hai bên xác nhận.
- Mỗi cuộc chat gắn với đúng một lịch hẹn (`appointmentId`). Đặt lại món đồ sẽ là cuộc chat mới, không dùng lại cuộc cũ.
- Chỉ hai người trong lịch hẹn được đọc và gửi tin nhắn.
- Khi lịch hẹn bị hủy hoặc hoàn thành, chat chuyển sang chỉ đọc.
- Đề xuất dữ liệu: collection `messages` gồm `id`, `appointmentId`, `senderId`, `text`, `createdAt`.
- Đề xuất endpoint: `GET /appointments/:id/messages`, `POST /appointments/:id/messages`.
- Phụ trách đề xuất: Tú (route `server/routes/messages.cjs`, màn hình chat). Sơn thêm collection `messages` vào `server/db.json`.
- Kiểm thử: người ngoài lịch hẹn bị từ chối; chưa đủ hai xác nhận thì không gửi được; tin nhắn không lẫn giữa hai lịch hẹn.

## 4. Hồ sơ cá nhân: thêm thông tin và cho chỉnh sửa
Hiện user chỉ có `id`, `email`, `studentId`, `fullName`, `avatarUrl`, `role`, `createdAt`, `updatedAt` (lưu trong collection `users` của `server/db.json`) và chưa có luồng sửa hồ sơ.

### Trường dữ liệu mới
| Trường | Ý nghĩa | Ai sửa được |
|---|---|---|
| `faculty` | Khoa | Chính chủ |
| `className` | Lớp | Chính chủ |
| `avatarUrl` | Ảnh đại diện | Chính chủ |
| `successfulExchanges` | Số lần giao dịch thành công | Chỉ server tính, không cho client ghi |
| `reputation` | Điểm uy tín | Chỉ server tính, không cho client ghi |

- `successfulExchanges` bằng số lịch hẹn `completed` mà user là người đặt hoặc chủ món đồ. Tính khi đọc hồ sơ, không lưu tay để tránh lệch dữ liệu.
- `reputation` do server tính từ dữ liệu giao dịch. Công thức cần chốt (xem phần bên dưới).
- `fullName` và `phoneNumber` chưa nằm trong phạm vi sửa lần này. Cần chốt thêm nếu muốn mở.
- `email`, `studentId`, `role` không cho sửa.

### Luồng người dùng
1. Tab Hồ sơ hiển thị đủ: ảnh, họ tên, Khoa, Lớp, số giao dịch thành công, uy tín.
2. Nút "Chỉnh sửa hồ sơ" mở màn hình `profile/edit`.
3. Sửa Khoa, Lớp và chọn ảnh mới (thư viện hoặc camera). Lưu thành công thì cập nhật ngay trên Hồ sơ và trên các màn hình khác dùng thông tin người đăng.
4. Lỗi mạng hoặc dữ liệu sai: hiển thị lỗi, giữ nguyên nội dung đang nhập.

### Quy tắc và quyền riêng tư
- Chỉ chính chủ được sửa hồ sơ của mình (server so khớp `userId` với người đang sửa; hiện server chưa có xác thực phiên nên demo dùng `userId` do app gửi và ghi chú rõ giới hạn này).
- Server từ chối trường ngoài danh sách cho phép (`faculty`, `className`, `avatarUrl`), gồm cả `successfulExchanges` và `reputation`.
- Hồ sơ công khai (`GET /users/:id/public`) trả thêm `faculty`, `className`, `successfulExchanges`, `reputation`, `avatarUrl`. Không trả email, mã sinh viên hay số điện thoại (B35).
- Ảnh đại diện: giới hạn dung lượng và định dạng (jpg/png). Mức demo lưu dưới dạng chuỗi ảnh trong `avatarUrl`; chưa có upload ảnh thật như các ảnh món đồ.

### Phân công đề xuất
| Người | Việc |
|---|---|
| Sơn | Mở rộng `User` và `PublicUser` trong `src/models/userModel.ts`; thêm trường vào `server/db.json`; `PATCH /users/:id` và mở rộng `GET /users/:id/public` trong `server/routes/users.cjs`; hàm gọi API trong `src/services/api/userService.ts`; cài `expo-image-picker` (`package.json`, `app.json`); test server |
| Phúc | `ProfileScreen` hiển thị thêm thông tin; màn hình `profile/edit` và controller sửa hồ sơ; chọn và xem trước ảnh; kiểm thử giao diện |
| Tú | Bảo đảm số giao dịch thành công khớp trạng thái lịch hẹn `completed` (kiểm thử lịch hẹn hoàn thành tăng số này) |
| Phú | Hiển thị Khoa/uy tín của người đăng trong danh sách và chi tiết món đồ khi cần, qua dữ liệu công khai |

### Kiểm thử
- Sửa hồ sơ của người khác bị từ chối; gửi `successfulExchanges` hoặc `reputation` bị từ chối (400).
- Hoàn thành một lịch hẹn thì `successfulExchanges` của cả hai bên tăng 1.
- Hồ sơ công khai không chứa email, mã sinh viên, số điện thoại.
- Đổi ảnh xong, tắt và mở lại app vẫn thấy ảnh mới (dữ liệu nằm trên server).

## Cần chốt trước khi làm
- Cách lưu xác nhận của hai bên (mục 2) vì ảnh hưởng cả mục 3.
- Chat có cần cập nhật thời gian thực hay chỉ tải lại khi mở màn hình (mức demo: tải lại định kỳ).
- Công thức uy tín (mục 4): chỉ dựa trên số giao dịch thành công, hay có đánh giá sao sau giao dịch và trừ điểm khi bị báo cáo? Đề xuất mức demo: tính từ số giao dịch thành công, trừ điểm cho báo cáo đã được xác nhận.
- Có cho sửa họ tên và số điện thoại trong lần này không.
- Ảnh đại diện chỉ chọn từ thư viện hay cả chụp bằng camera.
