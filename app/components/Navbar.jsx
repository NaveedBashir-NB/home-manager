"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { Moon, Sun, Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[#facc15] transition"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {!session ? (
            <>
              <button onClick={() => signIn("google")} className="btn-theme">
                Login
              </button>

              <button
                onClick={() => alert("Register functionality")}
                className="btn-theme"
              >
                Register
              </button>
            </>
          ) : (
            <>
              {/* Profile Icon */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black shadow hover:opacity-90 transition"
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
                  <div className="flex items-center gap-3 pb-4 border-b border-[var(--dropdown-border)]">
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
                    onClick={() => signOut()}
                    className="btn-theme w-full mt-3"
                  >
                    Logout
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

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-nav)] backdrop-blur-md px-6 pb-4 flex flex-col gap-4 animate-fadeIn">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-[var(--text-main)] w-fit"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {!session ? (
            <>
              <button onClick={() => signIn("google")} className="btn-theme">
                Login
              </button>

              <button
                onClick={() => alert("Register functionality")}
                className="btn-theme"
              >
                Register
              </button>
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
                onClick={() => signOut()}
                className="btn-theme w-full mt-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
