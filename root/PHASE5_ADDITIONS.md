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

## Cần chốt trước khi làm
- Cách lưu xác nhận của hai bên (mục 2) vì ảnh hưởng cả mục 3.
- Chat có cần cập nhật thời gian thực hay chỉ tải lại khi mở màn hình (mức demo: tải lại định kỳ).
