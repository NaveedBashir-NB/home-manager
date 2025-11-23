// logoutLocal.js
// Only clear the session flag; do NOT delete the stored user record.
// This prevents the user data being wiped on logout (so the user can re-login later).

export function logoutLocal() {
  if (typeof window === "undefined") return;
  // Remove only the active session marker
  localStorage.removeItem("hm_session");
  // Keep hm_user (user record) intact
}
