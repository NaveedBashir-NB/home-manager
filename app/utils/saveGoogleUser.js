// saveGoogleUser.js
export function saveGoogleUser(session) {
  if (!session?.user) return;

  const user = {
    name: session.user.name,
    email: session.user.email,
    password: null, // No password for Google users
    provider: "google",
  };

  // keep a pointer to the last logged-in user (existing behavior)
  localStorage.setItem("hm_user", JSON.stringify(user));

  // ALSO store a per-user record keyed by safe email so multiple google users don't overwrite each other
  const emailSafe = session.user.email.replace(/[@.]/g, "_");
  const userKey = `hm_user_${emailSafe}`;
  if (!localStorage.getItem(userKey)) {
    // Save only if not present — does not overwrite existing per-user data
    localStorage.setItem(userKey, JSON.stringify(user));
  }

  // Note: Do not touch hm_session here; the calling pages (login/register) set that.
}
