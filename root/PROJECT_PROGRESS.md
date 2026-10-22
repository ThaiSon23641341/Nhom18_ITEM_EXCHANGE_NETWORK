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
| 22/10/2026 | `ThaiSon23641341` | Báo cáo vi phạm và hàng chờ kiểm duyệt demo | Thêm gửi báo cáo, trạng thái xử lý/bỏ qua, phân trang, màn hình moderation demo và thiết lập Jest/CI | Đã merge | [PR #4](https://github.com/ThaiSon23641341/Nhom18_ITEM_EXCHANGE_NETWORK/pull/4), branch `feature/son-reporting-test-setup`, merge commit `b64435e` | 11/11 Jest tests đạt; `npx tsc --noEmit` và `npm run lint` đạt. Chưa có bằng chứng demo UI thủ công | Chạy thử luồng trên app; trước khi dùng thực tế cần backend và xác thực/phân quyền moderator |

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