import { API_BASE } from "../config/api";

/**
 * Wrapper around fetch that:
 *  1. Always sends cookies (credentials: "include")
 *  2. On a 401, tries to refresh the token once and retries
 *  3. On a second 401, redirects to /login
 */
export async function fetchWithAuth(url, options = {}) {
  const opts = { ...options, credentials: "include" };

  let response = await fetch(url, opts);

  if (response.status === 401) {
    // Try to refresh
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry original request
      response = await fetch(url, opts);
    }

    if (response.status === 401) {
      // Still unauthorized → redirect to login
      window.location.href = "/login";
      // Return a never-resolving promise so caller doesn't continue
      return new Promise(() => {});
    }
  }

  return response;
}

/**
 * Check if the current user is authenticated by hitting /auth/me.
 * Returns { id, role } or null.
 */
export async function getAuthUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Log out by calling /auth/logout and redirecting.
 */
export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/login";
}
