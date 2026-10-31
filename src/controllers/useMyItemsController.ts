import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { deleteItem } from '../services/api/itemService';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { useAuthController } from './useAuthController';
import { notifyItemsChanged, usePaginatedItems } from './usePaginatedItems';
import type { Item } from '../models/itemModel';

export function useMyItemsController() {
  const { user } = useAuthController();
  const paginated = usePaginatedItems({ query: user?.id ? { ownerId: user.id } : { ownerId: '__no_user__' }, pageSize: 8 });
  const { removeItemById } = paginated;
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestDelete = useCallback((item: Item) => {
    setDeleteError(null);
    setPendingDelete(item);
  }, []);
  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  const confirmDelete = useCallback(async (target?: Item) => {
    const itemToDelete = target ?? pendingDelete;
    if (!itemToDelete || deletingId) return;
    setDeletingId(itemToDelete.id);
    setDeleteError(null);
    try {
      await deleteItem(itemToDelete.id);
      removeItemById(itemToDelete.id);
      notifyItemsChanged();
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, pendingDelete, removeItemById]);

  const openCreate = useCallback(() => router.push('/item/create'), []);
  const openEdit = useCallback((id: string) => router.push(`/item/${id}/edit` as const), []);

  return {
    ...paginated,
    user,
    pendingDelete,
    deletingId,
    deleteError,
    requestDelete,
    confirmDelete,
    cancelDelete,
    openCreate,
    openEdit,
  };
}
