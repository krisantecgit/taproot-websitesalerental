// utils/uuid.js
export function generateUUID() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback (works everywhere)
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
