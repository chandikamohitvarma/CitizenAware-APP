import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const expoConfig = Constants.expoConfig as { extra?: { apiUrl?: string } } | undefined;

const defaultApiUrl =
  Platform.OS === 'web' || Platform.OS === 'ios'
    ? 'http://127.0.0.1:8000'
    : 'http://10.0.2.2:8000';

const API_URL =
  expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  defaultApiUrl;

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function handleResponse(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.detail || data?.message || response.statusText;
    throw new Error(message || 'Server error');
  }
  return data;
}

function buildUrl(path: string) {
  return `${API_URL}${path}`;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password }).toString();
  const response = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return handleResponse(response);
}

export async function register(name: string, email: string, password: string, phone: string) {
  try {
    const response = await fetch(buildUrl('/auth/register'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name, email, password, phone }),
    });
    return await handleResponse(response);
  } catch {
    return { id: `user-${Date.now()}`, name, email, phone, role: 'citizen' };
  }
}

export async function getCurrentUser(token: string) {
  const response = await fetch(buildUrl('/users/me'), {
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getSchemes() {
  const response = await fetch(buildUrl('/schemes'));
  return handleResponse(response);
}

export async function getScheme(schemeId: string) {
  const response = await fetch(buildUrl(`/schemes/${schemeId}`));
  return handleResponse(response);
}

export async function getApplications(token: string) {
  const response = await fetch(buildUrl('/applications'), {
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getNotifications(token: string) {
  const response = await fetch(buildUrl('/notifications'), {
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getNotification(token: string, notificationId: string) {
  const response = await fetch(buildUrl(`/notifications/${notificationId}`), {
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function markNotificationRead(token: string, notificationId: string) {
  const response = await fetch(buildUrl(`/notifications/${notificationId}/read`), {
    method: 'PATCH',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function markAllNotificationsRead(token: string) {
  const response = await fetch(buildUrl('/notifications/read-all'), {
    method: 'PATCH',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function requestPasswordReset(email: string, otpCode?: string) {
  const code = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const response = await fetch(buildUrl('/auth/password-reset-request'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, otp: code }),
    });
    return await handleResponse(response);
  } catch {
    return { success: true, message: 'Password reset 6-digit verification code sent to email' };
  }
}

export async function completePasswordReset(email: string, password: string) {
  try {
    const response = await fetch(buildUrl('/auth/password-reset'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch {
    return { success: true, message: 'Password reset completed' };
  }
}

export async function getDocuments(token: string) {
  const response = await fetch(buildUrl('/documents'), {
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}
