export function isLocalLoggedIn() {
  if (typeof window === "undefined") return false;

  const user = localStorage.getItem("hm_session");
  return !!user;
}
