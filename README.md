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
trong bo nho cua tien trinh app va chua duoc noi voi backend mau. Chua co xac
thuc hoac phan quyen moderator; man hinh kiem duyet chi phuc vu demo.

## Backend API demo

Backend mau doc lap nam trong `backend/`. API su dung du lieu seed trong bo nho,
khong ket noi MongoDB hoac database nao; khoi dong lai server se reset du lieu.
Xem `backend/README.md` de chay API, xem endpoint va thiet ke collection/index
MongoDB du kien. API demo chua co authentication/authorization, khong deploy nhu
backend production va chua duoc ket noi voi ung dung Expo.