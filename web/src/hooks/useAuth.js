// web/src/hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";

const KEY_TOKEN = "token";
const KEY_USER  = "user";

export function saveSession({ token, user }) {
  if (token) localStorage.setItem(KEY_TOKEN, token);
  if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
}
export function getToken() {
  return localStorage.getItem(KEY_TOKEN) || "";
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem(KEY_USER) || "null"); }
  catch { return null; }
}

export function useAuth() {
  const [token, setToken] = useState(getToken());
  const [user, setUser]   = useState(getUser());

  const login = useCallback((t, u) => {
    saveSession({ token: t, user: u });
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken("");
    setUser(null);
  }, []);

  // sync entre pestañas
  useEffect(() => {
    const onStorage = () => {
      setToken(getToken());
      setUser(getUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { token, user, login, logout, isAdmin: user?.rol === "admin" };
}
