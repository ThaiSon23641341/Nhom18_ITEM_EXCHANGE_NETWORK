# Checklist QA — phần Tú

Ngày cập nhật: 06/11/2026

## Kiểm thử tự động

| Hạng mục | Kết quả | Bằng chứng |
| --- | --- | --- |
| Lịch hẹn client | Pass | `src/services/api/appointmentService.test.ts`, `src/__tests__/appointmentService.test.ts` |
| Lịch hẹn server | Pass | `server/test/appointments.test.cjs` |
| Nhắc lịch native | Pass | `src/__tests__/notificationService.test.ts` |
| Deep link parser | Pass | `src/__tests__/deepLinkController.test.ts` |
| Toàn bộ app Jest | Pass — 75/75 | `npm test -- --runInBand` |
| TypeScript | Pass | `npx tsc --noEmit` |
| ESLint | Pass | `npm run lint` |
| Server tests | Pass — 14/14 | `npm run server:test` |

## Kiểm thử thủ công

| # | Ca kiểm thử | Nền tảng/thiết bị | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Đặt lịch hợp lệ bằng `item-001` với tài khoản `21036011.test@student.iuh.edu.vn` | Android (điện thoại) | Pass | Đặt lịch chạy được |
| 2 | Nhập `31/02`, ngày quá khứ và ngày ISO `yyyy-mm-dd` | Android (điện thoại) | Một phần | Ngày/giờ đã qua bị từ chối với thông báo “Ngày và giờ nhận đồ đã qua, vui lòng chọn thời gian khác”; cần xác nhận thêm `31/02` và định dạng ISO |
| 3 | Đặt món do chính mình sở hữu | Android (điện thoại) | Pass | Hiển thị “Không thể đặt món đồ của mình” |
| 4 | Xác nhận, hủy và hoàn thành lịch hẹn | Android (điện thoại) | Pass | Các thao tác chạy được |
| 5 | Cấp quyền và nhận nhắc lịch trước giờ hẹn | Android (điện thoại) | Cần kiểm tra lại | Lần test 06/11: lịch được tạo nhưng lời nhắc lỗi; đã thêm fallback channel Android, cần chạy lại |
| 6 | Từ chối quyền thông báo | Android (điện thoại) | Cần kiểm tra lại | Lần test 06/11: lịch vẫn được tạo nhưng lời nhắc lỗi; đã thêm fallback channel Android, cần chạy lại và xác nhận nhánh từ chối quyền |
| 7 | Chia sẻ món đồ | Android (điện thoại) | Pass | Chia sẻ được |
| 8 | Mở `nhom18item://item/<id>` từ bên ngoài app | Android (điện thoại) | Fail | Có link nhưng nhấn vào không điều hướng đến màn chi tiết |
| 9 | Mở URL web `/--/item/<id>` trực tiếp | Web | Pass | Điều hướng đến màn hình chi tiết |
| 10 | Chọn ảnh bằng camera/thư viện | Android (điện thoại) | Pass | Chụp ảnh và chọn ảnh từ thư viện được |

Kết quả trên được ghi nhận theo báo cáo kiểm thử thủ công của người thực hiện ngày 06/11/2026. Ca 2 cần xác nhận thêm hai kiểu dữ liệu không hợp lệ; ca 5–6 cần kiểm tra lại trên Android sau khi thêm fallback channel; ca 8 cần sửa điều hướng deep link Android. Unit test không thay thế kiểm thử thủ công.
