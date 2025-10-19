// src/middlewares/validate.js
export function badRequest(res, message) {
  return res.status(400).json({ message });
}
export function notFound(res, message = "No encontrado") {
  return res.status(404).json({ message });
}
export function handleError(res, err, fallback = "Error del servidor") {
  console.error(fallback, err);
  return res.status(500).json({ message: fallback });
}

// Helpers de validación
export function isPositiveNumber(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}
export function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}
export function isOptionalString(s) {
  return s === null || s === undefined || typeof s === "string";
}
export function isOptionalNumber(n) {
  return n === null || n === undefined || (typeof n === "number" && Number.isFinite(n));
}
