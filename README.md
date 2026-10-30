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

Yeu cau Node.js 20 tro len va Expo SDK 55.

```bash
npm install
npx expo start
```

## Kiểm thử đăng nhập

Ở màn hình đăng nhập, nhập email theo mẫu
`21036001.nguyen@student.iuh.edu.vn` rồi nhấn **Đăng nhập**. Email hợp lệ sẽ
đưa bạn vào các tab chính; email sai định dạng sẽ hiển thị thông báo lỗi. Mẫu
được kiểm tra là đúng 8 chữ số, dấu chấm, tên gồm chữ cái (có thể ngăn cách
bằng dấu chấm hoặc gạch nối), sau đó là `@student.iuh.edu.vn`.

Đây chỉ là đăng nhập mô phỏng để kiểm tra form và điều hướng, không xác minh
mật khẩu hay tài khoản với máy chủ. Phiên đăng nhập chỉ tồn tại trong bộ nhớ
khi app đang chạy.

## Kiem tra va test

Chay cac lenh sau truoc khi tao pull request:

```bash
npm run lint
npx tsc --noEmit
npm test -- --ci
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

## Mo phong API

`src/services/api/itemService.ts` cung cap mock API co delay 500 ms, phan trang
va loi khi item khong ton tai. Du lieu mau nam trong `mockData.ts` de co the
thay the bang backend that ma khong doi Model hoac Controller.

## Bao cao vi pham

Tu man hinh chi tiet mon do, chon **Bao cao vi pham** de chon ly do va gui ghi
chu toi da 500 ky tu. Route `/moderation/reports` hien thi hang doi, phan trang
va cho phep danh dau report la `actioned` hoac `dismissed`.

`src/services/api/reportService.ts` mo phong tao report, truy van hang doi va
cap nhat trang thai `pending`, `actioned` hoac `dismissed`. Du lieu chi nam
trong bo nho cua tien trinh app; chua co backend hoac phan quyen moderator.
Man hinh kiem duyet chi phuc vu demo, khong an toan cho production.