"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import InputField from "../components/InputField";
import { saveGoogleUser } from "../utils/saveGoogleUser";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { data: session } = useSession();

  // Auto-register Google user into localStorage (and start session)
  useEffect(() => {
    if (session?.user) {
      saveGoogleUser(session);
      if (typeof window !== "undefined") {
        localStorage.setItem("hm_session", "active");
      }
      window.location.href = "/dashboard";
    }
  }, [session]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const savedUser = localStorage.getItem("hm_user");

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === form.email) {
        alert("User already exists. Please login.");
        return;
      }
    }

    // Save user and set session active
    localStorage.setItem("hm_user", JSON.stringify(form));
    localStorage.setItem("hm_session", "active");

    alert("Account created successfully!");
    window.location.href = "/dashboard";
  }

  return (
    <div
      className="flex items-center justify-center relative w-screen overflow-x-hidden transition-colors duration-500"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/70 backdrop-blur-sm transition-colors duration-500"></div>

      {/* Form Container */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md bg-[var(--bg-nav)] dark:bg-[var(--bg-nav)] border border-[var(--dropdown-border)] backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">

        <h1 className="text-2xl sm:text-3xl font-[Poppins] text-center text-[var(--text-main)] mb-1 font-bold">
          Create Account
        </h1>
        <p className="text-sm sm:text-base font-[Inter] text-center text-[var(--text-muted)] mb-4">
          Sign up to start managing your household items.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <InputField
            label="Full Name"
            type="text"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            required
          />

          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="example@mail.com"
            onChange={handleChange}
            required
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-theme w-full py-2 text-sm sm:text-base">
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-[var(--text-muted)] text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={() => signIn("google")}
          className="btn-theme w-full py-2 text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-100 shadow transition"
        >
          Continue with Google
        </button>

        <p className="text-center text-[var(--text-muted)] mt-4 sm:mt-6 text-xs sm:text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
