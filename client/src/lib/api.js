import axios from "axios";

// Access tokens live in memory only; the refresh token is an httpOnly cookie.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthCall = url.startsWith("/auth/");

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          api
            .post("/auth/refresh")
            .then((response) => {
              setAccessToken(response.data.accessToken);
              return response;
            })
            .finally(() => {
              refreshPromise = null;
            });

        const refreshed = await refreshPromise;
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${refreshed.data.accessToken}`,
        };
        return api(original);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
