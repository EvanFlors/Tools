import { showGlobalToast } from "../components/Toast";
import { API_BASE } from "../config/api";

/**
 * Wrapper around fetch that:
 *  1. Always sends cookies (credentials: "include")
 *  2. On a 401, tries to refresh the token once and retries
 *  3. On a second 401, redirects to /login
 *  4. On network failure, shows a toast popup
 */
export async function fetchWithAuth(url, options = {}) {
  const opts = { ...options, credentials: "include" };

  let response;
  try {
    response = await fetch(url, opts);
  } catch {
    showGlobalToast(
      "Unable to connect to the server. Please make sure the backend is running.",
      "error"
    );
    throw new Response(
      JSON.stringify({
        message:
          "Unable to connect to the server. Please make sure the backend is running.",
      }),
      { status: 503 }
    );
  }

  if (response.status === 401) {
    let refreshRes;
    try {
      refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      window.location.href = "/login";
      return new Promise(() => {});
    }

    if (refreshRes.ok) {
      try {
        response = await fetch(url, opts);
      } catch {
        showGlobalToast(
          "Unable to connect to the server. Please make sure the backend is running.",
          "error"
        );
        throw new Response(
          JSON.stringify({
            message:
              "Unable to connect to the server. Please make sure the backend is running.",
          }),
          { status: 503 }
        );
      }
    }

    if (response.status === 401) {
      window.location.href = "/login";
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
