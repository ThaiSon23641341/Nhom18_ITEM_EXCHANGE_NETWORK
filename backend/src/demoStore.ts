import {
  seedAppointments,
  seedItems,
  seedReports,
  seedUsers,
} from './seedData.js';
import type {
  Appointment,
  Item,
  ItemReport,
  PublicUser,
  User,
} from './models.js';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const clone = <T>(value: T): T => structuredClone(value);

export class DemoStore {
  private users: User[] = clone(seedUsers);
  private items: Item[] = clone(seedItems);
  private appointments: Appointment[] = clone(seedAppointments);
  private reports: ItemReport[] = clone(seedReports);

  reset(): void {
    this.users = clone(seedUsers);
    this.items = clone(seedItems);
    this.appointments = clone(seedAppointments);
    this.reports = clone(seedReports);
  }

  listUsers(): User[] {
    return clone(this.users);
  }

  getPublicUser(id: string): PublicUser {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) {
      throw new ApiError('User was not found.', 404, 'NOT_FOUND');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    };
  }

  listItems(): Item[] {
    return clone(this.items);
  }

  getItem(id: string): Item {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item) {
      throw new ApiError('Item was not found.', 404, 'NOT_FOUND');
    }
    return clone(item);
  }

  createItem(item: Item): Item {
    if (this.items.some((candidate) => candidate.id === item.id)) {
      throw new ApiError('Item id already exists.', 409, 'CONFLICT');
    }
    this.items.unshift(clone(item));
    return clone(item);
  }

  updateItem(id: string, changes: Partial<Item>): Item {
    const index = this.items.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new ApiError('Item was not found.', 404, 'NOT_FOUND');
    }

    this.items[index] = { ...this.items[index], ...changes };
    return clone(this.items[index]);
  }

  deleteItem(id: string): void {
    const index = this.items.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new ApiError('Item was not found.', 404, 'NOT_FOUND');
    }
    this.items.splice(index, 1);
  }

  userExists(id: string): boolean {
    return this.users.some((user) => user.id === id);
  }

  listAppointments(): Appointment[] {
    return clone(this.appointments);
  }

  getAppointment(id: string): Appointment {
    const appointment = this.appointments.find(
      (candidate) => candidate.id === id,
    );
    if (!appointment) {
      throw new ApiError('Appointment was not found.', 404, 'NOT_FOUND');
    }
    return clone(appointment);
  }

  createAppointment(appointment: Appointment): Appointment {
    this.appointments.unshift(clone(appointment));
    return clone(appointment);
  }

  updateAppointment(id: string, changes: Partial<Appointment>): Appointment {
    const index = this.appointments.findIndex(
      (candidate) => candidate.id === id,
    );
    if (index === -1) {
      throw new ApiError('Appointment was not found.', 404, 'NOT_FOUND');
    }
    this.appointments[index] = { ...this.appointments[index], ...changes };
    return clone(this.appointments[index]);
  }

  listReports(): ItemReport[] {
    return clone(this.reports);
  }

  createReport(report: ItemReport): ItemReport {
    this.reports.unshift(clone(report));
    return clone(report);
  }

  updateReport(id: string, changes: Partial<ItemReport>): ItemReport {
    const index = this.reports.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new ApiError('Report was not found.', 404, 'NOT_FOUND');
    }
    this.reports[index] = { ...this.reports[index], ...changes };
    return clone(this.reports[index]);
  }

  itemExists(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}

export const demoStore = new DemoStore();
