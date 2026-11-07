import { useCallback, useEffect, useState } from 'react';
import type { EditableProfile, User } from '../models/userModel';
import { ApiClientError } from '../services/api/apiClient';
import { updateMyProfile } from '../services/api/userService';
import { fetchSession } from '../services/authService';
import { setAuthenticatedUser } from '../store/authSlice';
import { useAppDispatch } from '../store/hooks';
import { useAuthController } from './useAuthController';

export interface ProfileEditValues {
  faculty: string;
  className: string;
  avatarUrl: string;
}

export interface ProfileEditController {
  user: User | null;
  values: ProfileEditValues;
  isLoading: boolean;
  isSubmitting: boolean;
  loadError: string | null;
  submitError: string | null;
  setFaculty: (value: string) => void;
  setClassName: (value: string) => void;
  setAvatarUrl: (value: string) => void;
  retry: () => void;
  submit: () => Promise<boolean>;
}

const getErrorMessage = (error: unknown, fallback: string): string => (
  error instanceof Error ? error.message : fallback
);

const toProfileValues = (user: User): ProfileEditValues => ({
  faculty: user.faculty ?? '',
  className: user.className ?? '',
  avatarUrl: user.avatarUrl ?? '',
});

export function useProfileEditController(): ProfileEditController {
  const dispatch = useAppDispatch();
  const { user: sessionUser } = useAuthController();
  const [user, setUser] = useState<User | null>(sessionUser);
  const [values, setValues] = useState<ProfileEditValues>(() => (
    sessionUser ? toProfileValues(sessionUser) : { faculty: '', className: '', avatarUrl: '' }
  ));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    fetchSession()
      .then((loadedUser) => {
        if (!active) return;
        setUser(loadedUser);
        setValues(toProfileValues(loadedUser));
        dispatch(setAuthenticatedUser(loadedUser));
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(getErrorMessage(error, 'Không thể tải hồ sơ từ máy chủ.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, retryCount]);

  const setFaculty = useCallback((faculty: string) => {
    setValues((current) => ({ ...current, faculty }));
    setSubmitError(null);
  }, []);

  const setClassName = useCallback((className: string) => {
    setValues((current) => ({ ...current, className }));
    setSubmitError(null);
  }, []);

  const setAvatarUrl = useCallback((avatarUrl: string) => {
    setValues((current) => ({ ...current, avatarUrl }));
    setSubmitError(null);
  }, []);

  const retry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setRetryCount((count) => count + 1);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSubmitError('Bạn cần đăng nhập để cập nhật hồ sơ.');
      return false;
    }

    const faculty = values.faculty.trim();
    const className = values.className.trim();
    if (faculty.length > 100 || className.length > 50) {
      setSubmitError('Khoa tối đa 100 ký tự và lớp tối đa 50 ký tự.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const changes: Partial<EditableProfile> = {
        faculty,
        className,
        avatarUrl: values.avatarUrl,
      };
      const updatedUser = await updateMyProfile(user.id, changes);
      setUser(updatedUser);
      setValues(toProfileValues(updatedUser));
      dispatch(setAuthenticatedUser(updatedUser));
      return true;
    } catch (error) {
      const message = error instanceof ApiClientError || error instanceof Error
        ? error.message
        : 'Không thể lưu hồ sơ. Vui lòng thử lại.';
      setSubmitError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, user, values]);

  return {
    user,
    values,
    isLoading,
    isSubmitting,
    loadError,
    submitError,
    setFaculty,
    setClassName,
    setAvatarUrl,
    retry,
    submit,
  };
}
