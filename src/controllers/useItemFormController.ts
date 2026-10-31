/* eslint-disable react-hooks/set-state-in-effect -- Initial async data loading is synchronized with controller state. */
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

const EMPTY_VALUES: ItemFormValues = {
  title: '',
  description: '',
  category: '',
  condition: '',
  imageUrl: '',
  imageUrls: [],
  price: '',
  location: '',
};

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
      if (!user || loaded.ownerId !== user.id) {
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
        imageUrls: loaded.imageUrls?.length ? [...loaded.imageUrls] : loaded.imageUrl ? [loaded.imageUrl] : [],
        price: loaded.priceVnd === undefined ? '' : String(loaded.priceVnd),
        location: loaded.location ?? '',
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
    if (!user) {
      setSubmitError('Bạn cần đăng nhập để tiếp tục.');
      return;
    }
    if (!values.location.trim()) {
      setErrors((current) => ({ ...current, location: 'Vui lòng nhập địa điểm giao dịch.' }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let saved: Item;
      if (mode === 'create') {
        const imageUrls = values.imageUrls;
        saved = await createItem({
          title: values.title.trim(),
          description: values.description.trim(),
          category: values.category,
          condition: values.condition as ItemCondition,
          imageUrl: imageUrls[0] ?? '',
          imageUrls,
          ownerId: user.id,
          ownerName: user.fullName,
          ownerAvatarUrl: user.avatarUrl,
          priceVnd: values.price.trim() ? Number(values.price) : undefined,
          location: values.location.trim(),
        });
      } else {
        if (!itemId) throw new Error('Thiếu mã món đồ.');
        const changed: Partial<Pick<Item, 'title' | 'description' | 'category' | 'condition' | 'imageUrl' | 'imageUrls' | 'priceVnd' | 'location'>> = {};
        if (values.title !== initialValues.title) changed.title = values.title.trim();
        if (values.description !== initialValues.description) changed.description = values.description.trim();
        if (values.category !== initialValues.category) changed.category = values.category;
        if (values.condition !== initialValues.condition) changed.condition = values.condition as ItemCondition;
        if (values.imageUrl !== initialValues.imageUrl) changed.imageUrl = values.imageUrl;
        if (values.location !== initialValues.location) changed.location = values.location.trim();
        if (values.imageUrls !== initialValues.imageUrls) {
          changed.imageUrls = [...values.imageUrls];
          changed.imageUrl = values.imageUrls[0] ?? '';
        }
        if (values.price !== initialValues.price) {
          changed.priceVnd = values.price.trim() ? Number(values.price) : undefined;
        }
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
    user,
  };
}
