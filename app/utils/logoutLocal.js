export function logoutLocal() {
  localStorage.removeItem("hm_user");
  localStorage.removeItem("hm_session");
}
