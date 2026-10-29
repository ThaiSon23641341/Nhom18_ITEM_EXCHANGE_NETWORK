import { useCallback, useEffect, useMemo, useState } from 'react';
import { getItemById, createItem, updateItem } from '../services/api/itemService';
import { useAuthController } from './useAuthController';
import { notifyItemsChanged } from './usePaginatedItems';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { validateItemForm, type ItemFormErrors, type ItemFormValues } from '../utils/validateItem';
import type { Item, ItemCondition } from '../models/itemModel';

export interface UseItemFormControllerOptions {
  mode: 'create' | 'edit';
  itemId?: string;
  onSuccess: (item: Item) => void;
}

const EMPTY_VALUES: ItemFormValues = { title: '', description: '', category: '', condition: '', imageUrl: '' };

export function useItemFormController({ mode, itemId, onSuccess }: UseItemFormControllerOptions) {
  const { user } = useAuthController();
  const [values, setValues] = useState<ItemFormValues>(EMPTY_VALUES);
  const [initialValues, setInitialValues] = useState<ItemFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (mode !== 'edit' || !itemId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await getItemById(itemId);
      setItem(loaded);
      if (user && loaded.ownerId !== user.id) {
        setPermissionError('Bạn không có quyền sửa bài này.');
      } else if (loaded.status === 'exchanged') {
        setPermissionError('Món đã trao không thể chỉnh sửa.');
      } else {
        setPermissionError(null);
      }
      const next = {
        title: loaded.title,
        description: loaded.description,
        category: loaded.category,
        condition: loaded.condition as ItemCondition,
        imageUrl: loaded.imageUrl,
      };
      setValues(next);
      setInitialValues(next);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [itemId, mode, user]);

  useEffect(() => { void loadItem(); }, [loadItem]);

  const setField = useCallback(<K extends keyof ItemFormValues>(field: K, value: ItemFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const blurField = useCallback((field: keyof ItemFormValues) => {
    const fieldErrors = validateItemForm(values);
    setErrors((current) => ({ ...current, [field]: fieldErrors[field] }));
  }, [values]);

  const isDirty = useMemo(() => mode === 'create'
    ? true
    : Object.keys(initialValues).some((key) => values[key as keyof ItemFormValues] !== initialValues[key as keyof ItemFormValues]),
  [initialValues, mode, values]);

  const canSubmit = !isSubmitting && !isLoading && !permissionError && (mode === 'create' || isDirty);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    const nextErrors = validateItemForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (mode === 'create' && !user) {
      setSubmitError('Bạn cần đăng nhập để đăng món đồ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let saved: Item;
      if (mode === 'create') {
        saved = await createItem({ ...values, title: values.title.trim(), description: values.description.trim(), condition: values.condition as ItemCondition, ownerId: user!.id });
      } else {
        if (!itemId) throw new Error('Thiếu mã món đồ.');
        const changed: Partial<Pick<Item, 'title' | 'description' | 'category' | 'condition' | 'imageUrl'>> = {};
        (['title', 'description', 'category', 'condition', 'imageUrl'] as const).forEach((field) => {
          if (values[field] !== initialValues[field]) changed[field] = values[field] as never;
        });
        saved = await updateItem(itemId, changed);
      }
      notifyItemsChanged();
      onSuccess(saved);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, initialValues, itemId, mode, onSuccess, user, values]);

  return {
    values,
    errors,
    setField,
    blurField,
    submit,
    isSubmitting,
    submitError,
    isDirty,
    canSubmit,
    isLoading,
    loadError,
    retryLoad: loadItem,
    item,
    permissionError,
  };
}
