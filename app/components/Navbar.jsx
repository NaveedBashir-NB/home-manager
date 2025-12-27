"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const profileRef = useRef(null);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // Close drop-down on clicking outside the drop-down area
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Load local user only when there is an active local session
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLocalActive = localStorage.getItem("hm_session") === "active";
    if (isLocalActive) {
      try {
        const usr = JSON.parse(localStorage.getItem("hm_user") || "null");
        setLocalUser(usr);
      } catch {
        setLocalUser(null);
      }
    } else {
      setLocalUser(null);
    }
  }, []);

  // Combined user (NextAuth or Local Login) — only if session is active or localUser exists
  const localSessionActive =
    typeof window !== "undefined" &&
    localStorage.getItem("hm_session") === "active";
  const loggedInUser = session?.user || (localSessionActive ? localUser : null);

  const initials = loggedInUser?.name
    ? loggedInUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  async function handleLogout() {
    setLoggingOut(true);
    toast.loading("Logging out...");

    // For local login: remove only the session flag. Keep the user record intact.
    const doLocalLogout = !session;

    if (doLocalLogout) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hm_session");
        // KEEP localStorage 'hm_user' so user doesn't need to re-register
      }

      // Redirect immediately so navbar doesn't flicker
      setTimeout(() => {
        toast.dismiss();
        toast.success("Goodbye! See you soon 👋");
        window.location.href = "/";
      }, 700);
      return;
    }

    // If OAuth (next-auth) is active, call signOut which will redirect.
    // Do NOT clear hm_user here (we want to keep stored record).
    try {
      // next-auth signOut will redirect to callbackUrl
      await signOut({ callbackUrl: "/" });
      // signOut handles redirect; we don't need to modify localStorage here
    } catch (err) {
      toast.dismiss();
      toast.error("Logout failed. Try again.");
      setLoggingOut(false);
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full h-20 z-(--z-fixed) shadow-(--shadow-lg) transition-all bg-accent border-b-1  border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide text-secondary no-underline transition-all duration-500"
        >
          Home<span className="text-primary">Manager</span>
        </Link>

        <div className="flex gap-5">
          {/* Theme Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn btn-outline p-2 rounded-full w-10 h-10 transition"
          >
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!loggedInUser ? (
              <>
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div ref={profileRef} className="relative">
                  {/* Profile Icon */}
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center font-bold text-secondary shadow hover:opacity-90 transition cursor-pointer"
                  >
                    {profileOpen ? <X size={22} /> : initials}
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute top-20 right-10 w-68 rounded-xl shadow-xl p-4 bg-accent border border-primary-dark animate-fadeIn transition">
                      {/* User Info */}
                      <div className="flex items-center gap-3 pb-5 border-b border-primary-dark">
                        <div className="w-10 h-10 rounded-full bg-primary text-secondary flex items-center justify-center font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary my-1">
                            {loggedInUser.name}
                          </p>
                          <p className="text-xs text-secondary-light my-1">
                            {loggedInUser.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="btn btn-primary w-full mt-4 block text-center"
                      >
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="btn btn-primary w-full mt-3"
                      >
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-dark"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Mobile Dropdown */}
          <div className="fixed top-20 left-0 right-0 z-50 bg-accent backdrop-blur-md px-6 pb-4 flex flex-col gap-4 animate-fadeIn">
            {!loggedInUser ? (
              <>
                <Link
                  href="/login"
                  className="btn btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 py-5">
                  <div className="w-12 h-12 rounded-full bg-primary text-secondary flex items-center justify-center font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary my-1">
                      {loggedInUser.name}
                    </p>
                    <p className="text-sm text-secondary-light my-1">
                      {loggedInUser.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="btn btn-primary w-full text-center mt-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="btn btn-primary w-full mt-3"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
