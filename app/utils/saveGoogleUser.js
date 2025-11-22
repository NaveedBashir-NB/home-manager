export function saveGoogleUser(session) {
  if (!session?.user) return;

  const user = {
    name: session.user.name,
    email: session.user.email,
    password: null, // No password for Google users
    provider: "google",
  };

  localStorage.setItem("hm_user", JSON.stringify(user));
}
