"use client";
import { useState } from 'react';
import { useHMS } from '../context/HMSContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 30000;

export function useHMSApi() {
  const [loading, setLoading] = useState(false);
  const { notify } = useHMS();

  const callApi = async (
    endpoint: string, 
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET', 
    body?: unknown
  ) => {
    setLoading(true);

    // HIPAA: Reject requests without a valid session token (unless logging in or registering)
    const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    const token = localStorage.getItem('hms_token');
    if (!token && !isAuthRoute) {
      setLoading(false);
      // Silently redirect to login if no token — HIPAA session enforcement
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401 && !isAuthRoute) {
        // Token expired — force re-login
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user_role');
        localStorage.removeItem('hms_user_profile');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        notify('ERROR', 'Request timed out. Please check your connection.');
        throw error;
      }
      notify('ERROR', error instanceof Error ? error.message : 'HMS Secure API connection failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading };
}
