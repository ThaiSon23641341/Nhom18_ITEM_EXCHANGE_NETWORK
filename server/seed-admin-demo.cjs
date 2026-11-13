// Idempotently add or reset Admin Dashboard fixtures without replacing local data.
// Run from the repository root: node server/seed-admin-demo.cjs
const fs = require('node:fs');
const path = require('node:path');

const databasePath = path.join(__dirname, 'db.json');
const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
const createdAt = '2026-11-11T08:00:00.000Z';
const updatedAt = createdAt;
const imageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85';

const users = [
  {
    id: 'admin-demo-student-01', email: '21036101.mai@student.iuh.edu.vn',
    studentId: '21036101', fullName: 'Nguyễn Ngọc Mai', avatarUrl: '',
    role: 'student', faculty: 'Khoa Công nghệ thông tin', className: 'DHTH19A',
    reputationAdjustment: -50, createdAt, updatedAt,
  },
  {
    id: 'admin-demo-student-02', email: '21036102.bao@student.iuh.edu.vn',
    studentId: '21036102', fullName: 'Trần Gia Bảo', avatarUrl: '',
    role: 'student', faculty: 'Khoa Điện - Điện tử', className: 'DHDI19B',
    reputationAdjustment: 0, createdAt, updatedAt,
  },
  {
    id: 'admin-demo-student-03', email: '21036103.lan@student.iuh.edu.vn',
    studentId: '21036103', fullName: 'Lê Hoàng Lan', avatarUrl: '',
    role: 'student', faculty: 'Khoa Kế toán', className: 'DHKTO19A',
    reputationAdjustment: 40, createdAt, updatedAt,
  },
  {
    id: 'admin-demo-student-04', email: '21036104.khoa@student.iuh.edu.vn',
    studentId: '21036104', fullName: 'Phạm Minh Khoa', avatarUrl: '',
    role: 'student', faculty: 'Khoa Công nghệ thông tin', className: 'DHTH19C',
    reputationAdjustment: 100, createdAt, updatedAt,
  },
  {
    id: 'admin-demo-student-05', email: '21036105.ha@student.iuh.edu.vn',
    studentId: '21036105', fullName: 'Võ Ngọc Hà', avatarUrl: '',
    role: 'student', faculty: 'Khoa Ngoại ngữ', className: 'DHAV19A',
    reputationAdjustment: -15, isBanned: true, createdAt, updatedAt,
  },
  {
    id: 'admin-demo-student-06', email: '21036106.minh@student.iuh.edu.vn',
    studentId: '21036106', fullName: 'Đặng Quốc Minh', avatarUrl: '',
    role: 'student', faculty: '', className: '', createdAt, updatedAt,
  },
];

const items = [
  {
    id: 'admin-demo-item-available', ownerId: users[1].id,
    ownerName: users[1].fullName, ownerFaculty: users[1].faculty,
    title: 'Giáo trình Kinh tế vi mô', description: 'Sách còn tốt, có ghi chú ở một số trang.',
    category: 'Giáo trình', condition: 'good', imageUrl, status: 'available',
    priceVnd: 0, location: 'Thư viện IUH', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-item-report-scam', ownerId: users[2].id,
    ownerName: users[2].fullName, ownerFaculty: users[2].faculty,
    title: 'Máy tính cầm tay Casio', description: 'Máy hoạt động bình thường, có hộp.',
    category: 'Dụng cụ học tập', condition: 'good', imageUrl, status: 'available',
    priceVnd: 120000, location: 'KTX khu B', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-item-reserved', ownerId: users[3].id,
    ownerName: users[3].fullName, ownerFaculty: users[3].faculty,
    title: 'Balo laptop 15 inch', description: 'Balo chống nước, nhiều ngăn.',
    category: 'Phụ kiện', condition: 'good', imageUrl, status: 'reserved',
    priceVnd: 80000, location: 'Nhà H IUH', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-item-exchanged', ownerId: users[0].id,
    ownerName: users[0].fullName, ownerFaculty: users[0].faculty,
    title: 'Đèn bàn học LED', description: 'Đèn LED ba mức sáng, dùng tốt.',
    category: 'Đồ gia dụng', condition: 'good', imageUrl, status: 'exchanged',
    priceVnd: 0, location: 'KTX khu A', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-item-actioned', ownerId: users[4].id,
    ownerName: users[4].fullName, ownerFaculty: users[4].faculty,
    title: 'Tai nghe không dây', description: 'Bài đăng đã được moderator xử lý.',
    category: 'Phụ kiện', condition: 'fair', imageUrl, status: 'available',
    priceVnd: 50000, location: 'Cổng 1 IUH', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-item-no-image', ownerId: users[5].id,
    ownerName: users[5].fullName, ownerFaculty: users[5].faculty,
    title: 'Tập giấy A4', description: 'Tập giấy mới, chưa sử dụng.',
    category: 'Dụng cụ học tập', condition: 'new', imageUrl: '', status: 'available',
    priceVnd: 0, location: 'KTX khu B', createdAt, updatedAt,
  },
];

const reports = [
  {
    id: 'admin-demo-report-scam', itemId: 'admin-demo-item-report-scam',
    reporterId: users[0].id, reason: 'suspected_scam',
    details: 'Thông tin người bán và mô tả có dấu hiệu không khớp.',
    status: 'pending', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-report-prohibited', itemId: 'admin-demo-item-available',
    reporterId: users[1].id, reason: 'prohibited_item',
    details: 'Vui lòng kiểm tra mặt hàng trong bài đăng.',
    status: 'pending', createdAt: '2026-11-11T07:45:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-report-misleading', itemId: 'admin-demo-item-reserved',
    reporterId: users[2].id, reason: 'misleading_information',
    details: '', status: 'pending', createdAt: '2026-11-11T07:30:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-report-inappropriate', itemId: 'admin-demo-item-no-image',
    reporterId: users[3].id, reason: 'inappropriate_content',
    details: 'Nội dung có thể không phù hợp với quy định.',
    status: 'pending', createdAt: '2026-11-11T07:15:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-report-other', itemId: 'admin-demo-item-actioned',
    reporterId: users[4].id, reason: 'other', details: 'Báo cáo mẫu đã được xử lý.',
    status: 'actioned', createdAt: '2026-11-10T08:00:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-report-other-pending', itemId: 'admin-demo-item-available',
    reporterId: users[5].id, reason: 'other', details: 'Báo cáo khác để kiểm tra nhãn lý do.',
    status: 'pending', createdAt: '2026-11-11T07:00:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-report-dismissed', itemId: 'admin-demo-item-available',
    reporterId: users[5].id, reason: 'other', details: 'Báo cáo mẫu đã được bỏ qua.',
    status: 'dismissed', createdAt: '2026-11-09T08:00:00.000Z', updatedAt,
  },
];

const appointments = [
  {
    id: 'admin-demo-appointment-pending', itemId: items[0].id, requesterId: users[0].id,
    date: '2026-11-20', time: '09:00', scheduledAt: '2026-11-20T09:00:00.000Z',
    location: 'Thư viện IUH', status: 'pending', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-appointment-confirmed', itemId: items[2].id, requesterId: users[1].id,
    date: '2026-11-21', time: '13:30', scheduledAt: '2026-11-21T13:30:00.000Z',
    location: 'Sảnh nhà A', confirmedBy: [users[1].id, users[3].id],
    status: 'confirmed', createdAt, updatedAt,
  },
  {
    id: 'admin-demo-appointment-completed', itemId: items[3].id, requesterId: users[2].id,
    date: '2026-11-05', time: '10:00', scheduledAt: '2026-11-05T10:00:00.000Z',
    location: 'Nhà H IUH', confirmedBy: [users[2].id, users[0].id],
    completionConfirmedBy: [users[2].id, users[0].id],
    status: 'completed', createdAt: '2026-11-01T08:00:00.000Z', updatedAt,
  },
  {
    id: 'admin-demo-appointment-cancelled', itemId: items[1].id, requesterId: users[5].id,
    date: '2026-11-08', time: '14:00', scheduledAt: '2026-11-08T14:00:00.000Z',
    location: 'Cổng 1 IUH', cancelledBy: users[5].id,
    cancellationReason: 'Không còn nhu cầu.', status: 'cancelled',
    createdAt: '2026-11-07T08:00:00.000Z', updatedAt,
  },
];

function mergeFixtures(existing, fixtures) {
  const fixtureIds = new Set(fixtures.map((entry) => entry.id));
  return [...existing.filter((entry) => !fixtureIds.has(entry.id)), ...fixtures];
}

database.users = mergeFixtures(database.users ?? [], users);
database.items = mergeFixtures(database.items ?? [], items);
database.reports = mergeFixtures(database.reports ?? [], reports);
database.appointments = mergeFixtures(database.appointments ?? [], appointments);

fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
console.log('Added/reset Admin Dashboard demo fixtures: 6 users, 6 items, 7 reports, 4 appointments.');
