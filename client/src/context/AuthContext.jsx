import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

// The refresh endpoint rotates the refresh cookie and rejects a reused one.
// Coalesce concurrent refresh calls (React StrictMode mounts effects twice in
// development) so the second call can't invalidate the session the first gets.
let sessionRequest = null;

function loadSession() {
  if (!sessionRequest) {
    sessionRequest = api
      .post("/auth/refresh")
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.user;
      })
      .finally(() => {
        sessionRequest = null;
      });
  }
  return sessionRequest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove the legacy localStorage token from older builds.
    localStorage.removeItem("token");

    let cancelled = false;
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);

    loadSession()
      .then((sessionUser) => {
        if (!cancelled) setUser(sessionUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, hostelBlock) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      hostelBlock,
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* clearing local state is enough */
    }
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
