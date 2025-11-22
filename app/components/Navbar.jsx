"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
  X as XIcon,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // "light" | "dark"

  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  // compute initials safely
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  // apply theme to document root and persist
  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("theme");
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(theme === "light" ? "theme-light" : "theme-dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        // do not auto-close mobile if user intentionally clicked hamburger - but clicking outside will close
        // keep behaviour: clicking outside closes mobile menu
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-wide hover:opacity-90 transition">
          Home<span className="text-yellow-300">Manager</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {!session ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => signIn("google")}
                className="px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow-md hover:translate-y-[-1px] transition"
              >
                Login
              </button>

              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-white text-black font-semibold shadow-md hover:bg-gray-100 transition"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
              >
                {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  className="w-11 h-11 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold shadow-md hover:scale-105 transition"
                >
                  {profileOpen ? <XIcon size={18} /> : initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 ring-1 ring-black/5">
                    {/* name/email */}
                    <div className="px-5 pb-3 border-b border-gray-100">
                      <p className="font-medium text-sm text-gray-500 select-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 select-none">
                        {session.user?.email}
                      </p>
                    </div>

                    {/* actions */}
                    <div className="flex flex-col mt-2">
                      <Link
                        href="/dashboard"
                        className="px-5 py-3 mx-3 my-1 rounded-xl hover:bg-gray-50 transition flex items-center gap-3 text-gray-700 font-medium"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="px-5 py-3 mx-3 my-1 rounded-xl hover:bg-red-50 transition flex items-center gap-3 text-red-600 font-medium"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3" ref={mobileRef}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle menu"
            className="text-3xl leading-none"
          >
            {mobileOpen ? <XIcon size={24} /> : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-black/60 backdrop-blur-md px-6 pb-6 flex flex-col gap-4 animate-slideDown">
          {!session ? (
            <>
              <button
                onClick={() => signIn("google")}
                className="px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow-md"
              >
                Login
              </button>

              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-white text-black font-semibold shadow-md text-center"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold shadow-md">
                  {initials}
                </div>
                <div>
                  <p className="font-medium text-gray-200 select-none">{session.user?.name}</p>
                  <p className="text-sm text-gray-400 select-none">{session.user?.email}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-lg bg-white/5 text-center font-semibold hover:bg-white/10 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={() => signOut()}
                className="px-5 py-2 rounded-full bg-red-500 text-white font-semibold"
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
