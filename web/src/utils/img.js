// web/src/utils/img.js
export function imgSrc(url) {
  if (!url) return "/img/placeholder-300x200.png";
  if (url.startsWith("http")) return url;

  // sirve /uploads desde el backend (3000)
  if (url.startsWith("/uploads/")) {
    return `http://localhost:3000${url}`;
  }
  if (url.startsWith("/img/")) return url;

  const clean = url.replace(/^\/+/, "");
  return clean.startsWith("img/") ? `/${clean}` : `/img/${clean}`;
}
