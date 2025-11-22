"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { Moon, Sun, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <nav className="fixed top-0 left-0 w-full bg-[var(--bg-nav)] backdrop-blur-md z-50 shadow-lg transition">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide text-[var(--text-main)]"
        >
          Home<span className="text-yellow-400">Manager</span>
        </Link>
        <div className="flex gap-5">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[#facc15] transition"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!session ? (
              <>
                <Link href="/login" className="btn-theme">
                  Login
                </Link>

                <Link href="/register" className="btn-theme">
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Profile Icon */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black shadow hover:opacity-90 transition cursor-pointer"
                >
                  {profileOpen ? <X size={22} /> : initials}
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div
                    className="
                    absolute top-20 right-10 w-64
                    rounded-xl shadow-xl p-4
                    bg-[var(--dropdown-bg)]
                    border border-[var(--dropdown-border)]
                    animate-fadeIn transition
                  "
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-4 border-b border-[var(--dropdown-border)] ">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Dashboard */}
                    <Link
                      href="/dashboard"
                      className="btn-theme w-full mt-4 block text-center"
                    >
                      Dashboard
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setLoggingOut(true);
                        toast.loading("Logging out...");

                        // Clear local storage (local account)
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("hm_user");
                          localStorage.removeItem("hm_session");
                        }

                        setTimeout(() => {
                          toast.dismiss();
                          toast.success("Goodbye! See you soon 👋");

                          // Logout Google OAuth + redirect
                          signOut({ callbackUrl: "/" });
                        }, 1000);
                      }}
                      className="btn-theme w-full mt-3"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-main)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>
      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-nav)] backdrop-blur-md px-6 pb-4 flex flex-col gap-4 animate-fadeIn">
          {!session ? (
            <>
              <Link href="/login" className="btn-theme">
                Login
              </Link>

              <Link href="/register" className="btn-theme">
                Register
              </Link>
            </>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-main)]">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="btn-theme w-full text-center mt-2"
              >
                Dashboard
              </Link>

              <button
                onClick={() => {
                  setLoggingOut(true);
                  toast.loading("Logging out...");

                  // Clear local storage (local account)
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("hm_user");
                    localStorage.removeItem("hm_session");
                  }

                  setTimeout(() => {
                    toast.dismiss();
                    toast.success("Goodbye! See you soon 👋");

                    // Logout Google OAuth + redirect
                    signOut({ callbackUrl: "/" });
                  }, 1000);
                }}
                className="btn-theme w-full mt-3"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
