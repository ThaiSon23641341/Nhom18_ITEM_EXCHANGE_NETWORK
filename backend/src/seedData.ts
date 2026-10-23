import type { Appointment, Item, ItemReport, User } from './models.js';

export const seedUsers: User[] = [
  {
    id: 'user-001',
    email: 'sinhvien001@student.iuh.edu.vn',
    studentId: '21036001',
    fullName: 'Nguyen Minh Anh',
    avatarUrl: '',
    phoneNumber: '0900000001',
    role: 'student',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'user-002',
    email: 'sinhvien002@student.iuh.edu.vn',
    studentId: '21036002',
    fullName: 'Tran Gia Bao',
    avatarUrl: '',
    phoneNumber: '0900000002',
    role: 'student',
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-10-02T08:00:00.000Z',
  },
  {
    id: 'user-003',
    email: 'moderator@student.iuh.edu.vn',
    studentId: '21036003',
    fullName: 'Demo Moderator',
    avatarUrl: '',
    role: 'moderator',
    createdAt: '2026-10-03T08:00:00.000Z',
    updatedAt: '2026-10-03T08:00:00.000Z',
  },
];

export const seedItems: Item[] = [
  {
    id: 'item-001',
    ownerId: 'user-001',
    title: 'Giao trinh Lap trinh C',
    description: 'Sach dung tot, co ghi chu o mot vai trang.',
    category: 'Giao trinh',
    condition: 'good',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db',
    status: 'available',
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-10T08:00:00.000Z',
  },
  {
    id: 'item-002',
    ownerId: 'user-002',
    title: 'May tinh Casio FX-580VN X',
    description: 'May tinh hoat dong on dinh, kem vo bao ve.',
    category: 'Dung cu hoc tap',
    condition: 'good',
    imageUrl: '',
    status: 'available',
    createdAt: '2026-10-11T08:00:00.000Z',
    updatedAt: '2026-10-11T08:00:00.000Z',
  },
  {
    id: 'item-003',
    ownerId: 'user-001',
    title: 'Vo ghi chu A5',
    description: 'Vo con moi va chua su dung.',
    category: 'Dung cu hoc tap',
    condition: 'new',
    imageUrl: '',
    status: 'reserved',
    createdAt: '2026-10-12T08:00:00.000Z',
    updatedAt: '2026-10-12T08:00:00.000Z',
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: 'appointment-001',
    itemId: 'item-003',
    requesterId: 'user-002',
    date: '2026-11-01',
    time: '14:00',
    location: 'Thu vien IUH',
    status: 'pending',
    createdAt: '2026-10-13T08:00:00.000Z',
    updatedAt: '2026-10-13T08:00:00.000Z',
  },
];

export const seedReports: ItemReport[] = [
  {
    id: 'report-0001',
    itemId: 'item-001',
    reporterId: 'user-002',
    reason: 'misleading_information',
    details: 'Thong tin tinh trang can duoc kiem tra.',
    status: 'pending',
    createdAt: '2026-10-14T08:00:00.000Z',
    updatedAt: '2026-10-14T08:00:00.000Z',
  },
];
