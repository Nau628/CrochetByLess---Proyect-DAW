// web/src/context/Auth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, getToken } from "../api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  async function login(email, password) {
    // login no manda token; el token llega del response
    const res = await api("/api/auth/login", {
      method: "POST",
      body: { email, password },
      headers: { "Content-Type": "application/json" }
    });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const isAdmin = !!user && user.rol === "admin";
  const value = useMemo(() => ({ user, isAdmin, login, logout }), [user, isAdmin]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
