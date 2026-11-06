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
- `reputation` do server tính khi đọc hồ sơ. **Đã chốt:** dựa trên số giao dịch thành công, trừ điểm cho báo cáo đã được xử lý. Công thức demo: `reputation = clamp(50 + 5 × successfulExchanges − 10 × số báo cáo có status "actioned" trên các bài đăng của user, 0, 100)`. Hệ số 50, 5 và 10 là mức khởi điểm và có thể chỉnh trong một hằng số duy nhất ở server.
- **Đã chốt:** không cho sửa `fullName` và `phoneNumber` (cả hai chỉ đọc).
- `email`, `studentId`, `role` không cho sửa.

### Luồng người dùng
1. Tab Hồ sơ hiển thị đủ: ảnh, họ tên, Khoa, Lớp, số giao dịch thành công, uy tín.
2. Nút "Chỉnh sửa hồ sơ" mở màn hình `profile/edit`.
3. Sửa Khoa, Lớp và chọn ảnh mới. **Đã chốt:** ảnh đại diện chọn được từ thư viện hoặc chụp bằng camera (cần xin quyền tương ứng, từ chối quyền thì giữ ảnh cũ và báo lỗi). Lưu thành công thì cập nhật ngay trên Hồ sơ và trên các màn hình khác dùng thông tin người đăng.
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
- Điểm uy tín tăng theo giao dịch thành công và giảm khi có báo cáo "actioned"; luôn nằm trong khoảng 0–100.
- Gửi `fullName` hoặc `phoneNumber` trong yêu cầu sửa hồ sơ bị từ chối (400).

## 5. Chỉnh sửa giao diện thẻ món đồ
Nguồn: góp ý của Tú về thẻ món đồ ở danh sách. Hiện thẻ trong `src/views/screens/ItemListRow.tsx` chỉ hiển thị ảnh, tên, danh mục, tình trạng và trạng thái. Model `Item` đã có sẵn `ownerName`, `ownerAvatarUrl`, `priceVnd` và `location` nên chủ yếu là sửa phần hiển thị.

Thẻ cần bổ sung:
1. **Người đăng:** tên (kèm avatar nhỏ) để tăng độ tin cậy. Có thể kèm Khoa hoặc điểm uy tín sau khi mục 4 hoàn thành.
2. **Giá hoặc hình thức trao đổi:** miễn phí, bán hoặc đổi, để người xem biết cách nhận món. `priceVnd` bằng 0 là miễn phí, có giá là bán, không có giá là trao đổi (cùng quy tắc `formatPrice` đang dùng ở màn chi tiết).
3. **Địa điểm:** hiển thị gọn ở thẻ nếu còn chỗ; nếu thẻ chật thì chỉ để ở trang chi tiết.

Nguyên tắc: tên món vẫn là phần nổi nhất, văn bản dài thì cắt bằng `numberOfLines`, kiểm tra trên màn hình nhỏ. Hiển thị trạng thái (Đang giữ…) giữ nguyên. Trang chủ vẫn không hiện món đã trao (mục 1).

Phân công đề xuất:
| Người | Việc |
|---|---|
| Phú | `ItemListRow.tsx` và `ExploreScreen` (Phú là chủ danh sách món đồ); lấy dữ liệu người đăng, không để thẻ gọi thêm API cho từng dòng nếu server đã trả sẵn |
| Phúc | `ItemCard.tsx` và `ExpandableItemCard.tsx` trong `views/components/**` nếu dùng chung kiểu hiển thị; kiểm tra giao diện |

Kiểm thử: thẻ hiển thị đủ ba thông tin với món có và không có giá/địa điểm/ảnh người đăng; không vỡ bố cục với tên dài; kiểm tra trên Android, iOS và Web.

## 6. Bỏ ô nhập địa điểm khi đặt lịch hẹn
- Người đặt không còn nhập "Địa điểm gặp" ở màn đặt lịch (`BookAppointmentScreen`, `app/appointment/create`); địa điểm nhận đồ do người đăng quyết định nên ô này bị thừa.
- Lịch hẹn lấy địa điểm từ `item.location` của món đồ (nếu thiếu thì mặc định "Trong khuôn viên IUH"). Server vẫn lưu `location` trong lịch hẹn như hiện tại nhưng tự điền từ món đồ, không bắt buộc client gửi.
- Màn đặt lịch chỉ hiển thị địa điểm (chỉ đọc) và chọn ngày, giờ. `canContinue` không còn phụ thuộc vào địa điểm.
- Phụ trách: Tú (màn đặt lịch, `server/routes/appointments.cjs`, test lịch hẹn).
- Kiểm thử: tạo lịch không gửi `location` vẫn thành công và lịch có địa điểm của món đồ; màn đặt lịch không còn ô nhập địa điểm.

## 7. Hạn trao món đồ do người đăng đặt
- Khi đăng món (và khi sửa), người đăng chọn thời hạn muốn trao, ví dụ 1 tháng, để món không bị đặt quá lâu về sau (ví dụ sang năm sau).
- Đề xuất dữ liệu: thêm trường `availableUntil` (ngày hết hạn, ISO) vào `Item`. Giao diện cho chọn nhanh 1 tuần, 2 tuần, 1 tháng (mặc định), 3 tháng hoặc chọn ngày; server tính và kiểm tra `availableUntil` phải ở tương lai và không quá giới hạn tối đa (đề xuất 3 tháng, một hằng số duy nhất).
- Món quá hạn mà vẫn `available` thì không hiện ở trang chủ và không thể đặt lịch (server trả 409 "Món đã hết hạn trao"). Chủ món vẫn thấy trong "Đồ của tôi" và có thể gia hạn bằng cách sửa `availableUntil`.
- Ngày hẹn nhận đồ của lịch hẹn phải không muộn hơn `availableUntil` của món.
- Món đã `reserved` hoặc `exchanged` không bị ảnh hưởng bởi hạn; chỉ áp dụng cho món còn `available`.
- Phụ trách: Sơn (`Item` model và `server/db.json` thêm `availableUntil` cho dữ liệu mẫu), Phú (`server/routes/items.cjs`, form đăng/sửa, lọc trang chủ, `validateItem`), Tú (kiểm tra ngày hẹn so với hạn trong `server/routes/appointments.cjs` và màn đặt lịch).
- Kiểm thử: đăng món không có hạn dùng mặc định 1 tháng; hạn quá khứ hoặc vượt tối đa bị từ chối (400); món quá hạn không ở trang chủ và đặt lịch trả 409; ngày hẹn sau hạn bị từ chối.

## 8. Khóa sửa thông tin món đồ khi chủ món đã xác nhận lịch hẹn
- Ngay khi người đăng (chủ món) xác nhận lịch hẹn, món đồ không còn cho sửa thông tin (tên, mô tả, ảnh, giá, hạn...) và không cho xóa, không cần chờ cả hai bên xác nhận. Món đang `reserved` do có lịch `confirmed` được tính là khóa.
- Điều này mở rộng mục 2: mục 2 khóa lịch hẹn khi đủ hai xác nhận, mục này khóa món đồ từ lúc chủ món xác nhận. Hủy lịch hẹn (và món về lại `available`) thì mở khóa.
- Server: `PATCH` và `DELETE /items/:id` trả 409 khi món có lịch hẹn `confirmed` đang hiệu lực (hiện đã chặn với `exchanged`, phần này mở rộng quy tắc ở `server/routes/items.cjs` và `itemPermissions`). Giao diện ẩn hoặc vô hiệu nút sửa và xóa kèm lời giải thích.
- Phụ trách: Phú (`items.cjs`, `itemPermissions`, `MyItemsScreen`, `ItemFormScreen`); Tú cung cấp cách xác định lịch `confirmed` của một món.
- Kiểm thử: món có lịch `confirmed` sửa hoặc xóa trả 409; hủy lịch thì sửa lại được; món chỉ có lịch `pending` vẫn sửa được.

## 9. Mọi dữ liệu đọc, ghi và chỉnh sửa trên server
Nguyên tắc: server (`server/db.json` qua các route) là nguồn dữ liệu duy nhất. App không giữ dữ liệu nghiệp vụ chỉ ở máy; đổi máy hoặc cài lại app vẫn thấy đủ thông tin, và mọi chỉnh sửa phải được server lưu rồi app mới hiển thị.

Phạm vi dữ liệu:
| Dữ liệu | Hiện trạng | Cần đạt |
|---|---|---|
| Bài đăng món đồ | Tạo, sửa, xóa đã qua `/items` | Giữ nguyên; thêm `availableUntil` (mục 7); ảnh món đồ hiện chưa upload, cần lưu ảnh trên server hoặc lưu chuỗi ảnh trong bài đăng để máy khác xem được |
| Lịch hẹn | Lưu trong `appointments` trên server | Mọi đổi trạng thái (xác nhận, hủy, hoàn thành) và địa điểm lấy từ món (mục 6) đều do server ghi và kiểm tra; app luôn tải lại từ server thay vì giữ bản sao |
| Nhắc lịch | Chỉ đặt cục bộ trên điện thoại, server không biết | Lưu thời điểm nhắc của lịch (ví dụ `reminderAt`) trên server; khi mở app hoặc đăng nhập trên máy khác thì đặt lại nhắc từ dữ liệu server |
| Tài khoản và hồ sơ | Chưa có luồng sửa; phiên đăng nhập chỉ nằm trong Redux, tắt app là mất | Sửa hồ sơ qua `PATCH /users/:id` (mục 4); lưu phiên đăng nhập ở máy (token hoặc `userId`) và tải lại hồ sơ từ server khi mở app |
| Yêu thích | Đã qua `/favorites` | Giữ nguyên, kiểm tra không còn cache cục bộ lệch với server |
| Báo cáo vi phạm | Đã qua `/reports` | Giữ nguyên |
| Tin nhắn | Chưa có | Lưu trong `messages` trên server (mục 3) |

Quy tắc chung:
- Ghi thành công mới cập nhật giao diện; ghi lỗi thì báo lỗi và giữ nguyên dữ liệu đang nhập.
- Chỉ lưu ở máy những thứ không phải dữ liệu nghiệp vụ: phiên đăng nhập, lịch nhắc đã đặt (để hủy khi cần).
- Giới hạn của demo: server chưa có xác thực phiên, nên quyền "chỉ chủ mới được sửa" vẫn dựa vào `userId` do app gửi (đã ghi ở mục 4).

Việc cần làm:
1. Kiểm kê: lập danh sách mọi nơi app còn giữ dữ liệu nghiệp vụ ở máy hoặc dữ liệu mẫu (`src/services/api/mockData.ts`, cache trong controller, store) và đối chiếu từng nơi với route trên server.
2. Phụ trách đề xuất: Sơn (model và `db.json`, `PATCH /users/:id`, lưu phiên đăng nhập trong store và `authService`), Tú (lưu `reminderAt` và đặt lại nhắc từ `appointments`), Phú (ảnh món đồ và `availableUntil`), Phúc (hồ sơ và yêu thích dùng dữ liệu từ server).

Kiểm thử:
- Đăng nhập, tắt hẳn app rồi mở lại vẫn còn phiên và hồ sơ từ server.
- Sửa bài đăng, hồ sơ hoặc lịch hẹn ở một máy thì máy khác tải lại thấy đúng nội dung mới.
- Đặt lịch xong, xóa dữ liệu app và đăng nhập lại: lịch hẹn và nhắc lịch vẫn còn.
- Ngắt server thì thao tác ghi báo lỗi rõ ràng và không tạo dữ liệu chỉ nằm ở máy.

## 9.1 Luồng chi tiết: phiên đăng nhập, nhắc lịch, ảnh

### a. Phiên đăng nhập lưu trên server
- Đăng nhập (`POST /auth/login`, `/auth/register`) tạo một phiên trong collection `sessions` của `server/db.json` (`id`/`token` ngẫu nhiên, `userId`, `createdAt`, `expiresAt`) và trả `token` cùng hồ sơ user. Mật khẩu vẫn chỉ nằm trong `credentials`, không bao giờ trả ra.
- App chỉ giữ `token` ở máy (dùng `expo-secure-store`, cài bằng `npx expo install`), không giữ dữ liệu hồ sơ làm nguồn chính.
- Mở app: nếu có `token` thì gọi `GET /auth/session` (kèm `Authorization: Bearer <token>`); hợp lệ thì tải hồ sơ từ server và vào thẳng app, hết hạn hoặc không hợp lệ (401) thì xóa `token` và về màn đăng nhập.
- Đăng xuất: `DELETE /auth/session` xóa phiên trên server rồi xóa `token` ở máy. Đổi mật khẩu hoặc đặt lại mật khẩu thì hủy mọi phiên cũ của user.
- Hạn phiên đề xuất 30 ngày, đặt trong một hằng số ở server. Server bắt đầu dùng `token` để biết người đang gọi, nhờ đó các quy tắc "chỉ chủ được sửa" (mục 4, 8) lấy `userId` từ phiên thay vì từ dữ liệu app gửi; làm dần theo từng route, route nào chưa chuyển thì ghi chú rõ.
- Phụ trách: Sơn (`server/routes/users.cjs`/auth, `server/lib`, `db.json`, `authService`, `authSlice`, `apiClient`, `package.json`). Phúc cập nhật `ProfileScreen` và nút đăng xuất gọi đúng luồng này.
- Kiểm thử: đăng nhập, tắt hẳn app, mở lại vẫn vào được; đăng xuất rồi gọi `GET /auth/session` bằng `token` cũ trả 401; `token` hết hạn bị từ chối; mật khẩu và `credentials` không xuất hiện trong bất kỳ phản hồi nào.

### b. Nhắc lịch lưu trên server
- Lịch hẹn có thêm `reminderAt` (ISO) và `reminderMinutes` (mặc định đang là 1 phút, nên đổi thành giá trị thực tế như 60 phút) do server tính khi tạo lịch từ ngày giờ hẹn; không cho bên đặt lịch tự ghi thời điểm nhắc tùy ý.
- Luồng tạo: đặt lịch thành công thì server trả lịch kèm `reminderAt`; app dùng giá trị đó để đặt thông báo cục bộ (`notificationService`), không tự tính riêng.
- Luồng sửa: đổi ngày giờ (khi còn được sửa, xem mục 2) hoặc hủy, hoàn thành thì server cập nhật hoặc xóa `reminderAt`; app hủy nhắc cũ và đặt nhắc mới theo dữ liệu mới.
- Khôi phục: khi mở app hoặc đăng nhập trên máy khác, app tải danh sách lịch của user (`GET /appointments?userId=...`) và đặt lại nhắc cho mọi lịch `confirmed` còn tương lai chưa có nhắc trên máy. Cả hai bên (người đặt và chủ món) đều nhận nhắc.
- Giữ ở máy chỉ id thông báo đã đặt (để hủy được), không coi đó là dữ liệu nghiệp vụ.
- Phụ trách: Tú (`server/routes/appointments.cjs`, `appointmentModel`, `notificationService`, `AppointmentsScreen`, test); Sơn thêm trường vào dữ liệu mẫu `db.json` nếu cần.
- Kiểm thử: tạo lịch trả `reminderAt` đúng bằng giờ hẹn trừ `reminderMinutes`; hủy hoặc hoàn thành thì không còn nhắc; đăng nhập ở máy khác vẫn đặt lại được nhắc; client gửi `reminderAt` bị bỏ qua hoặc từ chối.
- Giới hạn: Expo Go Android không đặt được channel thông báo, cần development build để thử đầy đủ.

### c. Ảnh món đồ và ảnh đại diện lưu trên server
- Hiện `imageUrl` và `imageUrls` chỉ là chuỗi địa chỉ do người dùng nhập hoặc dữ liệu mẫu, ảnh chọn từ máy không được tải lên nên máy khác không thấy.
- Thêm `POST /uploads` nhận ảnh (jpg/png, giới hạn dung lượng, đề xuất 5 MB) từ người đã đăng nhập, lưu file vào thư mục `server/uploads/` (không đưa vào git) và trả URL công khai dạng `/uploads/<tên-file>`. Server tự đặt tên file, không dùng tên người gửi, kiểm tra định dạng bằng nội dung chứ không chỉ đuôi file.
- Luồng đăng món: chọn ảnh từ thư viện hoặc camera, xem trước, bấm lưu thì app tải ảnh lên `POST /uploads` trước, rồi gửi bài đăng với URL nhận được. Tải ảnh lỗi thì không tạo bài.
- Luồng sửa món: thêm, thay hoặc xóa ảnh trong form sửa, tải ảnh mới lên rồi `PATCH /items/:id` với danh sách `imageUrls` mới; ảnh bị bỏ khỏi bài thì server xóa file khi không còn bài nào dùng. Món đã khóa (mục 8) không sửa được ảnh.
- Luồng ảnh đại diện: cùng cơ chế `POST /uploads`, rồi `PATCH /users/:id` với `avatarUrl` (mục 4). Ảnh cũ được dọn khi không còn dùng.
- Trên máy khác hoặc sau khi cài lại app, ảnh vẫn hiện vì nằm trên server. App ghép URL tương đối với `EXPO_PUBLIC_API_URL`.
- Phụ trách: Sơn (`server/routes/uploads.cjs` mới, `server/lib`, `server.cjs` phục vụ `/uploads`, `.gitignore` cho `server/uploads/`, `expo-image-picker`); Phú (form đăng và sửa món, `itemService`); Phúc (ảnh đại diện trong màn sửa hồ sơ, `ItemCard`).
- Kiểm thử: tải ảnh hợp lệ trả URL xem được; file sai định dạng hoặc quá lớn bị từ chối (400); người chưa đăng nhập tải lên bị từ chối (401); đăng món trên máy A thì máy B thấy ảnh; xóa ảnh khỏi bài thì file được dọn; ngắt server giữa chừng không tạo bài chỉ có ảnh ở máy.

## 9.2 Giới hạn của server hiện tại (JSON Server chạy cục bộ)
- "Server" trong kế hoạch này là JSON Server demo (`server/server.cjs`, dữ liệu trong `server/db.json`) chạy trên máy của người phát triển, không phải server trên mạng. Điện thoại chỉ kết nối được khi cùng Wi-Fi với máy đó, qua `EXPO_PUBLIC_API_URL` (IP LAN đổi theo mạng nên phải cập nhật `.env.local`).
- Hệ quả: tắt server hoặc tắt máy thì app không đọc và ghi được dữ liệu; mỗi máy phát triển có `db.json` riêng nên dữ liệu không đồng bộ giữa các thành viên. "Máy khác thấy dữ liệu" trong các kiểm thử nghĩa là hai điện thoại cùng kết nối tới một server cục bộ.
- Mọi thứ mới (bảng `sessions`, `reminderAt`, thư mục `server/uploads/`) cũng nằm trên máy chạy server. `server/uploads/` và dữ liệu test phải được git bỏ qua; không commit thay đổi `db.json` sinh ra khi test (như quy ước hiện nay).
- Khi mất kết nối server, app phải báo lỗi rõ ràng, không lưu dữ liệu nghiệp vụ tạm ở máy rồi coi như đã thành công.
- Ngoài phạm vi giai đoạn 5: đưa server lên máy chủ thật hoặc dịch vụ đám mây, dùng cơ sở dữ liệu thật, và lưu ảnh trên kho lưu trữ riêng. Nếu cần demo ngoài mạng nội bộ thì xử lý ở giai đoạn sau (ví dụ tunnel hoặc triển khai server).

## 10. Giao diện trang chủ: chế độ xem, bộ lọc gọn, ảnh lớn
Hiện trang Khám phá (`ExploreScreen`) là danh sách một cột dùng `ItemListRow`, bộ lọc `ItemFilterBar` đặt phía trên danh sách nên chiếm nhiều chỗ, ảnh món nhỏ. Yêu cầu: người dùng dễ nhìn ảnh hơn, tương tự cách app X (Twitter) hiển thị bài (ảnh lớn gần hết chiều ngang, thông tin người đăng và tên ngay trên và dưới ảnh).

1. **Nút bật tắt 1 cột hoặc 2 cột:**
   - Thanh trên của trang chủ có nút chuyển giữa 1 cột (thẻ lớn, mặc định như hiện tại nhưng ảnh to hơn) và 2 cột (lưới thẻ nhỏ gọn để xem nhiều món).
   - Dùng `FlatList` với `numColumns` và đổi `key` khi đổi số cột (React Native không cho đổi `numColumns` tại chỗ). Giữ phân trang, kéo làm mới, tải thêm như cũ.
   - Lưu lựa chọn của người dùng ở máy (sở thích giao diện, không phải dữ liệu nghiệp vụ; xem mục 9) để lần sau mở app vẫn giữ.
   - Cần hai kiểu thẻ: thẻ 1 cột (ảnh gần full chiều ngang, tỉ lệ 4:3 hoặc 1:1) và thẻ 2 cột (ảnh vuông, tên tối đa 2 dòng). Cả hai hiển thị đủ nội dung của mục 5 (người đăng, giá hoặc hình thức, địa điểm nếu còn chỗ).
2. **Bộ lọc chiếm ít diện tích hơn:**
   - Thu gọn thành một hàng: ô tìm kiếm cùng nút "Bộ lọc" (kèm số điều kiện đang bật) và nút đổi cột; các lựa chọn danh mục, tình trạng, sắp xếp nằm trong bottom sheet hoặc hàng chip cuộn ngang một dòng.
   - Thanh tìm kiếm và bộ lọc ẩn khi cuộn xuống và hiện lại khi cuộn lên để nhường chỗ cho ảnh (tùy chọn nếu kịp thời gian).
   - Giữ nguyên hành vi lọc hiện có (`itemFilters`), chỉ đổi cách trình bày; giữ nhãn truy cập (`aria-label`) cho các nút.
3. **Ảnh bài đăng lớn hơn:** ảnh là phần chính của thẻ, bo góc, giữ tỉ lệ cố định để danh sách không nhảy khi ảnh tải; ảnh tải chậm hoặc lỗi hiển thị khung chờ và biểu tượng thay thế; nhiều ảnh thì hiển thị ảnh đầu và số ảnh còn lại. Món đã `reserved` có nhãn nổi trên ảnh.

Phụ trách đề xuất: Phú (chủ `ExploreScreen`, `ItemFilterBar`, `ItemListRow`, `ListStateView`, `itemFilters`, test); Phúc (thẻ dùng chung trong `views/components/**` nếu dùng lại cho hai kiểu thẻ). Cần thống nhất với mục 5 để chỉ sửa thẻ một lần.

Kiểm thử:
- Bật tắt 1 cột và 2 cột không mất vị trí cuộn quá mức, không lỗi cảnh báo `numColumns`; lựa chọn được giữ sau khi tắt và mở lại app.
- Bộ lọc và tìm kiếm cho kết quả giống trước khi đổi giao diện; số điều kiện lọc hiển thị đúng.
- Tên dài, không ảnh, ảnh lỗi, không có giá hoặc không có địa điểm đều không vỡ bố cục trên màn hình nhỏ.
- Kiểm tra trên Android, iOS và Web; trang chủ vẫn không hiện món đã trao (mục 1).

## 11. Phân công file giai đoạn 5 (mỗi file chỉ một chủ)
Bảng này là phân công chính thức. Nếu khác phần "Phụ trách đề xuất" ở mục 1 đến 10 thì theo mục 11. Quy ước giữ như giai đoạn 4 (`PHASE4_ASSIGNMENT.md`): file của ai người đó sửa, cần sửa file người khác thì nhờ chủ file; `package*.json`, `app.json` và `server/db.json` chỉ Sơn sửa.

### Sơn
| Việc | File sửa | File mới |
|---|---|---|
| Thư viện, cấu hình | `package.json`, `package-lock.json`, `app.json` (plugin và quyền camera, thư viện ảnh), `.gitignore` (`server/uploads/`), `.env.example` | cài `expo-secure-store`, `expo-image-picker`, `@react-native-async-storage/async-storage` bằng `npx expo install` |
| Dữ liệu mẫu | `server/db.json`: `faculty`, `className` cho user; `availableUntil` cho món; `reminderAt` cho lịch; collection `sessions` và `messages` | |
| Gắn route server | `server/server.cjs` (gắn `uploads.cjs`, `messages.cjs`), `server/lib/**` (helper phiên, lấy `userId` từ token, tính uy tín) | `server/routes/uploads.cjs`, `server/lib/session.cjs`, `server/lib/reputation.cjs` |
| Phiên đăng nhập | `server/routes/users.cjs` (đăng nhập tạo phiên, `GET` và `DELETE /auth/session`, hủy phiên khi đổi mật khẩu), `src/services/authService.ts`, `src/store/**`, `src/controllers/useAuthController.ts`, `src/services/api/apiClient.ts` (gắn `Authorization`), `RegisterScreen.tsx`, `ForgotPasswordScreen.tsx` | `src/controllers/useSessionBootstrap.ts` |
| Hồ sơ trên server | `src/models/userModel.ts`, `src/models/index.ts`, `server/routes/users.cjs` (`PATCH /users/:id`, mở rộng `GET /users/:id/public`), `src/services/api/userService.ts` | |
| Tải ảnh | `src/services/api/index.ts` | `src/services/api/uploadService.ts`, `src/services/media/imagePickerService.ts` (chọn ảnh từ thư viện hoặc camera, xin quyền) |
| Test | `server/test/users.test.cjs`, `server/test/auth.test.cjs` | `server/test/uploads.test.cjs`, `server/test/sessions.test.cjs`, test của `uploadService` và `imagePickerService` đặt cạnh file nguồn |
| Tài liệu | `root/PROJECT_PROGRESS.md`, `root/PHASE5_ADDITIONS.md`, `server/README.md` | |

### Phú
| Việc | File sửa | File mới |
|---|---|---|
| Món đồ trên server | `server/routes/items.cjs` (lọc `available` và chưa hết hạn ở trang chủ, kiểm `availableUntil`, khóa sửa và xóa khi món có lịch `confirmed`, bắt buộc có `location`), `src/models/itemModel.ts` (thêm `availableUntil`), `src/services/api/itemService.ts`, `src/services/api/mockData.ts`, `src/utils/itemPermissions.ts`, `src/utils/validateItem.ts`, `src/utils/itemOptions.ts`, `src/utils/constants.ts` | `src/utils/availability.ts` (hạn trao, các mức chọn nhanh) |
| Form đăng và sửa món | `ItemFormScreen.tsx`, `CreateItemScreen.tsx`, `useItemFormController.ts`, `useItemController.ts` (chọn hạn trao, nhập địa điểm, chọn ảnh qua `ImagePickerField` của Phúc và `uploadService` của Sơn) | |
| Trang chủ và bộ lọc | `ExploreScreen.tsx`, `ItemFilterBar.tsx`, `ItemListRow.tsx` (chọn thẻ 1 cột hoặc 2 cột theo chế độ xem), `ListStateView.tsx`, `useExploreController.ts`, `usePaginatedItems.ts`, `src/utils/itemFilters.ts` | `src/views/screens/ItemFilterSheet.tsx`, `src/utils/viewModePreference.ts` (lưu chế độ 1 hoặc 2 cột) |
| Đồ của tôi | `MyItemsScreen.tsx`, `useMyItemsController.ts` (ẩn và vô hiệu nút sửa, xóa khi món bị khóa) | |
| Khởi động app | `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx` | `src/controllers/useAppBootstrap.ts` (gom `useSessionBootstrap` của Sơn và `useReminderSyncController` của Tú, `_layout.tsx` chỉ gọi hook này) |
| Báo cáo | `server/routes/reports.cjs`, `reportService.ts`, `ReportModerationScreen.tsx` | (không đổi trong giai đoạn 5) |
| Test | `server/test/items.test.cjs`, `server/test/reports.test.cjs`, test của `itemService`, `itemPermissions`, `validateItem`, `itemFilters` | test của `availability.ts` và `viewModePreference.ts` đặt cạnh file nguồn |

### Tú
| Việc | File sửa | File mới |
|---|---|---|
| Lịch hẹn trên server | `server/routes/appointments.cjs` (địa điểm lấy từ món, kiểm ngày hẹn không quá `availableUntil`, `reminderAt` do server tính, xác nhận hai bên và khóa theo mục 2), `src/models/appointmentModel.ts`, `src/services/api/appointmentService.ts` | |
| Bỏ ô địa điểm | `BookAppointmentScreen.tsx`, `src/app/appointment/create.tsx`, `src/app/appointment/confirm.tsx`, `useAppointmentController.ts` | |
| Danh sách lịch hẹn | `AppointmentsScreen.tsx`, `useAppointmentsController.ts` (nút mở chat khi đủ hai xác nhận) | |
| Nhắc lịch từ server | `src/services/device/notificationService.ts` | `src/controllers/useReminderSyncController.ts` (tải lịch `confirmed` còn tương lai rồi đặt lại nhắc khi mở app), `src/services/appointments/reminderSync.ts` |
| Chat theo lịch hẹn | | `server/routes/messages.cjs` (Sơn tạo file rỗng để gắn route trong bước 0 rồi giao cho Tú), `src/models/messageModel.ts` (import trực tiếp, không sửa `src/models/index.ts`), `src/services/api/messageService.ts`, `src/controllers/useChatController.ts`, `src/views/screens/ChatScreen.tsx`, `src/app/appointment/[id]/chat.tsx` |
| Số giao dịch thành công | `server/routes/appointments.cjs` bảo đảm lịch `completed` ghi đúng; số này do `server/lib/reputation.cjs` của Sơn đọc ra | |
| QA | `root/PHASE3_QA_CHECKLIST.md`, `eas.json` | |
| Test | `server/test/appointments.test.cjs`, `src/__tests__/**`, test của `appointmentService` | `server/test/messages.test.cjs`, test của `messageService` và `useChatController` |

### Phúc
| Việc | File sửa | File mới |
|---|---|---|
| Hồ sơ | `ProfileScreen.tsx`, `src/app/(tabs)/profile.tsx` (hiển thị Khoa, Lớp, số giao dịch, uy tín, nút "Chỉnh sửa hồ sơ", đăng xuất), `usePublicProfileController.ts` | `src/app/profile/edit.tsx`, `src/views/screens/ProfileEditScreen.tsx`, `src/controllers/useProfileEditController.ts` |
| Thành phần dùng chung | `src/views/components/ItemCard.tsx`, `ExpandableItemCard.tsx`, `ProductCard.tsx` | `src/views/components/ItemCardLarge.tsx` (thẻ 1 cột, ảnh lớn), `src/views/components/ItemCardGrid.tsx` (thẻ 2 cột), `src/views/components/OwnerBadge.tsx` (avatar nhỏ, tên, uy tín), `src/views/components/ImagePickerField.tsx` (chọn và xem trước ảnh, dùng chung cho ảnh đại diện và ảnh món) |
| Chi tiết món | `ItemDetailScreen.tsx` (hiển thị người đăng, hạn trao, địa điểm), `useItemDetailController.ts` | |
| Đăng nhập | `LoginScreen.tsx` (chỉ sửa giao diện, không đổi luồng phiên của Sơn) | |
| Yêu thích | `server/routes/favorites.cjs`, `favoriteService.ts`, `useFavoritesController.ts` | |
| Báo cáo món | `ItemReportScreen.tsx`, `useItemReportController.ts` | |
| Giao diện chung | `tamagui.config.ts`, `assets/**` | |
| Test | `server/test/favorites.test.cjs`, `ProfileScreen.test.tsx`, `ItemDetailScreen.test.tsx`, `LoginScreen.test.tsx`, `ItemReportScreen.test.tsx` | test của `ProfileEditScreen`, `useProfileEditController`, các thẻ mới đặt cạnh file nguồn |

### Chỗ giao nhau và hợp đồng giữa các người
| Chỗ giao nhau | Cách tránh trùng file |
|---|---|
| Thẻ món (mục 5, 10) | Phúc làm `ItemCardLarge`, `ItemCardGrid`, `OwnerBadge` với props `item` và `onPress`; Phú chỉ chọn thẻ trong `ItemListRow.tsx` theo chế độ xem. Không ai sửa file của người kia |
| Chọn và tải ảnh | Sơn cung cấp `imagePickerService` và `uploadService`; Phúc làm `ImagePickerField` gọi hai service này; Phú dùng `ImagePickerField` trong form món, Phúc dùng trong sửa hồ sơ |
| Khóa món khi chủ xác nhận (mục 8) | Quy ước: món bị khóa khi trong collection `appointments` có lịch của món đó ở trạng thái `confirmed`. Phú tự đọc `db` trong `items.cjs`, Tú không sửa `items.cjs`; Tú chỉ bảo đảm trạng thái lịch đúng |
| Hạn trao (mục 7) | Phú kiểm tra và lưu `availableUntil` trong `items.cjs`; Tú đọc `availableUntil` của món trong `appointments.cjs` để từ chối ngày hẹn quá hạn; Sơn chỉ thêm dữ liệu mẫu |
| Uy tín và số giao dịch (mục 4) | Sơn tính trong `server/lib/reputation.cjs` và trả qua `users.cjs`, chỉ đọc `appointments` và `reports` từ `db`; Tú và Phú không tính lại |
| Khởi động app (phiên, nhắc lịch) | Sơn viết `useSessionBootstrap`, Tú viết `useReminderSyncController`, Phú gom trong `useAppBootstrap` và gọi một lần ở `_layout.tsx` |
| Gắn route mới vào server | Chỉ Sơn sửa `server/server.cjs`; Tú và Phú không thêm dòng `require` |
| Dữ liệu mẫu | Chỉ Sơn sửa `server/db.json`; cần thêm dữ liệu thì nhờ Sơn trước khi mở PR; không commit thay đổi `db.json` sinh ra khi test |
| Test | Test của tính năng mới đặt cạnh file nguồn hoặc trong `server/test/` của đúng chủ; riêng `src/__tests__/**` chỉ Tú sửa |

### Thứ tự thực hiện để không chờ nhau
1. **Sơn (bước 0):** thư viện, `app.json`, `db.json`, `server.cjs`, file rỗng `messages.cjs`, phiên đăng nhập, `PATCH /users/:id`, `uploads.cjs`, `imagePickerService`, `uploadService`, `useSessionBootstrap`. Merge trước.
2. **Phúc và Tú song song** (dựa trên bước 0): Phúc làm `ImagePickerField` và các thẻ dùng chung, Tú làm chat, nhắc lịch từ server, bỏ ô địa điểm.
3. **Phú** (dựa trên bước 1 và 2): form món với hạn trao và ảnh, lọc và khóa món, trang chủ 1 hoặc 2 cột, `useAppBootstrap`.
4. **Phúc:** màn hồ sơ và sửa hồ sơ, chi tiết món.
5. Mỗi người một PR cho mỗi bước, chỉ chứa file trong cột của mình; trước khi mở PR chạy `npm test`, `npm run server:test`, `npx tsc --noEmit`, `npm run lint`.

## Đã chốt và còn mở
Đã chốt: công thức uy tín (mục 4), không sửa họ tên và số điện thoại, ảnh đại diện chọn từ thư viện hoặc camera, bỏ ô địa điểm khi đặt lịch (mục 6), người đăng đặt hạn trao món (mục 7), khóa sửa món từ khi chủ món xác nhận (mục 8).

Còn mở:
- Cách lưu xác nhận của hai bên (mục 2) vì ảnh hưởng cả mục 3.
- Chat có cần cập nhật thời gian thực hay chỉ tải lại khi mở màn hình (mức demo: tải lại định kỳ).
- Thẻ món đồ (mục 5): hiển thị địa điểm ở thẻ hay chỉ ở trang chi tiết.
- Hạn trao (mục 7): mức tối đa (đề xuất 3 tháng) và các lựa chọn nhanh.
- Cách xác định "chủ món đã xác nhận" (mục 8) khi chưa lưu từng bên xác nhận: dùng trạng thái `confirmed` hiện có (người đăng là bên xác nhận) cho đến khi mục 2 thống nhất `confirmedBy`.
- Mục 9.1: hạn phiên (đề xuất 30 ngày), giá trị nhắc trước giờ hẹn (đề xuất 60 phút), dung lượng ảnh tối đa (đề xuất 5 MB), và có chuyển các route sang lấy `userId` từ phiên ngay trong giai đoạn 5 hay làm dần.
