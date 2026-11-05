# Checklist QA — phần Tú

Ngày cập nhật: 05/11/2026

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

## Kiểm thử thủ công cần thực hiện

| # | Ca kiểm thử | Nền tảng/thiết bị | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Đặt lịch hợp lệ bằng `item-001` với tài khoản `21036011.test@student.iuh.edu.vn` | Web/Android/iOS | Chưa chạy | Xác nhận lịch ở trạng thái pending |
| 2 | Nhập `31/02`, ngày quá khứ và ngày ISO `yyyy-mm-dd` | Web/Android/iOS | Chưa chạy | Hiển thị lỗi, không tạo lịch |
| 3 | Đặt món do chính mình sở hữu | Web/Android/iOS | Chưa chạy | Bị từ chối |
| 4 | Xác nhận, hủy và hoàn thành lịch hẹn | Web/Android/iOS | Chưa chạy | Kiểm tra item reserved/available/exchanged |
| 5 | Cấp quyền và nhận nhắc lịch trước giờ hẹn | Android/iOS | Chưa chạy | Web không hỗ trợ native notification |
| 6 | Từ chối quyền thông báo | Android/iOS | Chưa chạy | Lịch vẫn tạo, hiển thị cảnh báo |
| 7 | Chia sẻ món đồ | Web/Android/iOS | Chưa chạy | Link chứa đúng item id |
| 8 | Mở `nhom18item://item/<id>` từ bên ngoài app | Android/iOS | Chưa chạy | Điều hướng đến màn chi tiết |
| 9 | Mở URL web `/--/item/<id>` trực tiếp | Web | Chưa chạy | Điều hướng đến màn chi tiết |
| 10 | Chọn ảnh bằng camera/thư viện | Android/iOS | Chưa chạy | Kiểm tra quyền và hiển thị ảnh |

Các ca “Chưa chạy” cần được cập nhật bởi người nghiệm thu trên thiết bị thật hoặc emulator; unit test không thay thế kiểm thử thủ công.
