# Nhom 18 Item Exchange Network

Ung dung React Native Expo/TypeScript cho phep sinh vien trao doi, tang va tim
do dung hoc tap trong truong.

## Kien truc MVC

Code nghiep vu nam trong `src/` va duoc tach thanh cac tang:

- `src/models`: interfaces, types va DTO cua domain.
- `src/views`: man hinh va component giao dien.
- `src/controllers`: custom hooks dieu phoi state, validation va service.
- `src/services`: API client, mock API va cac wrapper ben ngoai.
- `src/utils`: ham dung chung khong phu thuoc UI.

`App.tsx` la entry point hien tai cua Expo. Khi mo rong ung dung, View khong
goi API truc tiep; Controller se truyen du lieu va event handlers vao View.

## Cai dat va chay du an

Yeu cau Node.js 20 tro len va Expo SDK 58.

```bash
npm install
npm --prefix server install
npm run server
```

In another terminal:

```bash
npx expo start
```

The app's default API address is `http://localhost:3001`. Copy `.env.example`
to `.env.local` and set `EXPO_PUBLIC_API_URL` for the target device if needed:
Android emulator uses `http://10.0.2.2:3001`; a physical phone uses the computer's
LAN IP. See [server/README.md](./server/README.md).

## Kiểm thử đăng nhập

Ở màn hình đăng nhập, nhập email theo mẫu
`21036001.nguyen@student.iuh.edu.vn` rồi nhấn **Đăng nhập**. Email hợp lệ sẽ
được tra hoặc tạo thành hồ sơ demo trong JSON Server; email sai định dạng hoặc
server không chạy sẽ hiển thị thông báo lỗi. Mẫu
được kiểm tra là đúng 8 chữ số, dấu chấm, tên gồm chữ cái (có thể ngăn cách
bằng dấu chấm hoặc gạch nối), sau đó là `@student.iuh.edu.vn`.

Đây chỉ là đăng nhập demo không mật khẩu, không xác minh quyền sở hữu email và
không an toàn để dùng production. Phiên Redux chỉ tồn tại trong bộ nhớ của app;
tải lại app sẽ yêu cầu đăng nhập lại. Chỉ dùng dữ liệu giả.

## Kiem tra va test

Chay cac lenh sau truoc khi tao pull request:

```bash
npm run lint
npx tsc --noEmit
npm test -- --ci
npm run server:test
```

Test dung Jest voi preset `jest-expo`; test nam canh service/model voi hau to
`.test.ts` hoac `.test.tsx`. Dung `npm run test:watch` khi phat trien.

## Quy trinh Git

- `main`: ban on dinh, san sang phat hanh.
- `develop`: nhanh tich hop phat trien.
- `feature/<ten-chuc-nang>`: nhanh cho mot tinh nang cu the, tao tu `develop`.

Moi thay doi can duoc review qua pull request. Commit dung Conventional
Commits, vi du:

- `feat: add item pagination`
- `fix: handle missing item`
- `docs: update setup guide`
- `refactor: extract item service`

## JSON Server cho kiểm thử app

`server/` chạy JSON Server với dữ liệu mẫu trong `server/db.json`. Danh sách,
chi tiết, tạo/cập nhật/xóa bài đăng, báo cáo, hồ sơ demo và tra cứu public
profile dùng REST API tại port 3001. Dữ liệu JSON Server được lưu xuống file và
giữ lại sau khi restart; khôi phục `server/db.json` từ Git để reset dữ liệu.
Redux Toolkit giữ trạng thái phiên đăng nhập trong bộ nhớ ứng dụng.

Luồng lịch hẹn vẫn dùng service demo trong bộ nhớ riêng và chưa đồng bộ với
JSON Server. Ảnh chọn từ thiết bị hiện lưu bằng URI cục bộ, chưa được tải lên
server. JSON Server không cung cấp xác thực/phân quyền hoặc bảo vệ quyền sở
hữu; API chỉ dùng trên mạng tin cậy với dữ liệu giả. Muốn phát hành thật cần
backend có xác thực, phân quyền và cơ sở dữ liệu phù hợp.

## Bao cao vi pham

Tu man hinh chi tiet mon do, chon **Bao cao vi pham** de chon ly do va gui ghi
chu toi da 500 ky tu. Route `/moderation/reports` hien thi hang doi, phan trang
va cho phep danh dau report la `actioned` hoac `dismissed`.

`src/services/api/reportService.ts` tạo report, truy vấn hàng chờ và cập nhật
trạng thái `pending`, `actioned` hoặc `dismissed` qua JSON Server. Chưa có xác
thực/phân quyền moderator; màn hình kiểm duyệt chỉ phục vụ demo.

## Backend API demo

Backend Express mẫu độc lập nằm trong `backend/`; đây là API để kiểm thử contract,
không phải nguồn dữ liệu được app Expo sử dụng. Xem `backend/README.md` để chạy
API và đọc thiết kế MongoDB dự kiến. Cả backend này và JSON Server đều không có
authentication/authorization đầy đủ, không deploy như backend production.