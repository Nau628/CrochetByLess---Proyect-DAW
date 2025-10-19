// web/src/api.js
export function getToken() {
  return localStorage.getItem("token") || "";
}
export function setToken(t) {
  if (!t) localStorage.removeItem("token");
  else localStorage.setItem("token", t);
}

export async function api(path, opts = {}) {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${path.startsWith("/") ? path : "/" + path}`;

  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body instanceof FormData ? opts.body : (opts.body ? JSON.stringify(opts.body) : undefined),
    credentials: "same-origin",
  });

  // intenta parsear JSON; si no hay, devuelve texto
  let data;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
