/**
 * API utility functions for making authenticated requests
 * Handles token refresh automatically on 401 errors
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Store new tokens
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);

      // Also store new refresh token if provided
      if (data.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }

      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * Automatically retries with refreshed token on 401
 */
export async function apiRequest(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Prepare headers
  const headers = new Headers(fetchOptions.headers);

  if (!skipAuth) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  // Make request
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // If 401 and not skipping auth, try to refresh token
  if (response.status === 401 && !skipAuth) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      // Retry request with new token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    } else {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = '/auth/login';
    }
  }

  return response;
}

/**
 * Helper for GET requests
 */
export async function apiGet(endpoint: string, options?: ApiOptions) {
  return apiRequest(endpoint, { ...options, method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function apiPost(endpoint: string, body: any, options?: ApiOptions) {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper for PUT requests
 */
export async function apiPut(endpoint: string, body: any, options?: ApiOptions) {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete(endpoint: string, options?: ApiOptions) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Parse API response and handle errors
 */
export async function parseApiResponse<T = any>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data.data;
}
