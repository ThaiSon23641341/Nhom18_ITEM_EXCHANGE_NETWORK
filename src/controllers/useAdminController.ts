import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Item } from '../models/itemModel';
import type { ItemReport } from '../models/reportModel';
import type { User } from '../models/userModel';
import { API_BASE_URL, ApiClientError, apiRequest } from '../services/api/apiClient';
import { deleteItem, updateItem } from '../services/api/itemService';
import { updateItemReportStatus } from '../services/api/reportService';
import { getAdminUsers, updateAdminUser } from '../services/api/adminService';
import { useAuthController } from './useAuthController';

export type AdminTab = 'reports' | 'items' | 'users';
export type AdminItemFilter = 'all' | 'available' | 'reserved' | 'exchanged' | 'actioned';
export type AdminAction =
  | { kind: 'dismiss-report'; report: ItemReport }
  | { kind: 'remove-item'; item: Item }
  | { kind: 'ban-user'; user: User }
  | { kind: 'set-user-status'; user: User }
  | { kind: 'adjust-reputation'; user: User; amount: -10 | 10 }
  | { kind: 'set-item-status'; item: Item; status: Item['status'] }
  | { kind: 'delete-item'; item: Item };

export interface AdminReportRow extends ItemReport {
  item?: Item;
  reporter?: User;
}

export interface AdminMetrics {
  students: number;
  availableItems: number;
  pendingReports: number;
  completedExchanges: number;
}

const EMPTY_METRICS: AdminMetrics = {
  students: 0,
  availableItems: 0,
  pendingReports: 0,
  completedExchanges: 0,
};

const messageFromError = (error: unknown): string => {
  if (error instanceof ApiClientError && error.status === 404) {
    return 'JSON Server chưa nạp API quản trị mới. Hãy dừng rồi chạy lại lệnh npm run server.';
  }
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

export function useAdminController() {
  const { user: adminUser, logout } = useAuthController();
  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>(EMPTY_METRICS);
  const [health, setHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemFilter, setItemFilter] = useState<AdminItemFilter>('all');
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [isActing, setIsActing] = useState(false);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const healthResult = await fetch(`${API_BASE_URL}/health`);
      setHealth(healthResult.ok ? 'online' : 'offline');
    } catch {
      setHealth('offline');
    }

    try {
      const [nextUsers, nextItems, nextReports, nextMetrics] = await Promise.all([
        getAdminUsers(),
        apiRequest<Item[]>('/items?_sort=createdAt&_order=desc'),
        apiRequest<ItemReport[]>('/reports?_sort=createdAt&_order=desc'),
        apiRequest<AdminMetrics>('/admin/metrics'),
      ]);
      const usersById = new Map(nextUsers.map((user) => [user.id, user]));
      const itemsById = new Map(nextItems.map((item) => [item.id, item]));
      setUsers(nextUsers);
      setItems(nextItems);
      setReports(nextReports.map((report) => ({
        ...report,
        item: itemsById.get(report.itemId),
        reporter: usersById.get(report.reporterId),
      })));
      setMetrics(nextMetrics);
    } catch (loadError) {
      setError(messageFromError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void refresh();
  }, [refresh]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    if (!query) return users;
    return users.filter((user) => [user.fullName, user.studentId, user.faculty ?? '']
      .some((value) => value.toLocaleLowerCase('vi').includes(query)));
  }, [searchQuery, users]);

  const actionedItemIds = useMemo(() => new Set(
    reports.filter((report) => report.status === 'actioned').map((report) => report.itemId),
  ), [reports]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return items.filter((item) => {
      const matchesSearch = !query || [item.title, item.ownerName ?? '', item.ownerId]
        .some((value) => value.toLocaleLowerCase('vi').includes(query));
      const matchesStatus = itemFilter === 'all'
        || (itemFilter === 'actioned' ? actionedItemIds.has(item.id) : item.status === itemFilter);
      return matchesSearch && matchesStatus;
    });
  }, [actionedItemIds, itemFilter, items, searchQuery]);

  const runAction = useCallback(async (action: AdminAction) => {
    setIsActing(true);
    setActionError(null);
    try {
      switch (action.kind) {
        case 'dismiss-report': {
          const updated = await updateItemReportStatus(action.report.id, 'dismissed');
          setReports((current) => current.map((report) => report.id === updated.id
            ? { ...report, ...updated }
            : report));
          setMetrics((current) => ({ ...current, pendingReports: Math.max(0, current.pendingReports - 1) }));
          break;
        }
        case 'remove-item':
        case 'delete-item':
          await deleteItem(action.item.id);
          setItems((current) => current.filter((item) => item.id !== action.item.id));
          setMetrics((current) => ({
            ...current,
            availableItems: Math.max(0, current.availableItems - (action.item.status === 'available' ? 1 : 0)),
          }));
          if (action.kind === 'remove-item') {
            const pending = reports.find((report) => report.itemId === action.item.id && report.status === 'pending');
            if (pending) {
              const updated = await updateItemReportStatus(pending.id, 'actioned');
              setReports((current) => current.map((report) => report.id === updated.id
                ? { ...report, ...updated }
                : report));
              setMetrics((current) => ({ ...current, pendingReports: Math.max(0, current.pendingReports - 1) }));
            }
          }
          break;
        case 'ban-user':
        case 'set-user-status': {
          const updated = await updateAdminUser(action.user.id, {
            isBanned: action.kind === 'ban-user' || !action.user.isBanned,
          });
          setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
          setReports((current) => current.map((report) => report.reporterId === updated.id
            ? { ...report, reporter: updated }
            : report));
          break;
        }
        case 'adjust-reputation': {
          const updated = await updateAdminUser(action.user.id, { reputationDelta: action.amount });
          setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
          setReports((current) => current.map((report) => report.reporterId === updated.id
            ? { ...report, reporter: updated }
            : report));
          break;
        }
        case 'set-item-status': {
          const updated = await updateItem(action.item.id, { status: action.status });
          setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
          setMetrics((current) => ({
            ...current,
            availableItems: current.availableItems
              + (action.item.status === 'available' ? -1 : 0)
              + (action.status === 'available' ? 1 : 0),
          }));
          break;
        }
        default:
          break;
      }
      setPendingAction(null);
    } catch (actionFailure) {
      setActionError(messageFromError(actionFailure));
    } finally {
      setIsActing(false);
    }
  }, [reports]);

  const reportRows = useMemo(() => reports.filter((report) => report.status === 'pending'), [reports]);

  return {
    adminUser, logout,
    activeTab, setActiveTab, users: filteredUsers, allUsers: users, items: filteredItems,
    allItems: items, reports: reportRows, metrics, health, isLoading, error, actionError,
    searchQuery, setSearchQuery, itemFilter, setItemFilter, refresh, pendingAction,
    setPendingAction, confirmAction: () => pendingAction && void runAction(pendingAction),
    isActing, isBanned: (userId: string) => users.some((user) => user.id === userId && user.isBanned === true),
    reputationOf: (user: User) => user.reputation ?? 50,
  };
}

