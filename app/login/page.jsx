"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const savedUser = localStorage.getItem("hm_user");

    if (!savedUser) {
      alert("No user found. Please register first.");
      return;
    }

    const parsed = JSON.parse(savedUser);

    if (parsed.email === form.email && parsed.password === form.password) {
      alert("Login successful!");
      window.location.href = "/dashboard";
    } else {
      alert("Incorrect email or password.");
    }
  }

  return (
    <div
      className="flex items-center justify-center relative w-screen overflow-x-hidden transition-colors duration-500"
      style={{ minHeight: "calc(100vh - 80px)" }} // Deduct navbar height
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors duration-500"></div>

      {/* Form Container */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md bg-[var(--bg-nav)] dark:bg-[var(--bg-nav)] border border-[var(--dropdown-border)] backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-[Poppins] text-center text-[var(--text-main)] mb-1 font-bold">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base font-[Inter] text-center text-[var(--text-muted)] mb-4">
          Login to continue managing your home.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          {/* Email */}
          <div>
            <label className="text-[var(--text-main)] font-semibold text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full mt-1 px-4 py-2 bg-white/20 dark:bg-black/30 text-[var(--text-main)] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[var(--text-main)] font-semibold text-sm sm:text-base">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 bg-white/20 dark:bg-black/30 text-[var(--text-main)] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-theme w-full py-2 text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-[var(--text-muted)] text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => signIn("google")}
          className="btn-theme w-full py-2 text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-100 shadow transition"
        >
          Continue with Google
        </button>

        {/* Link to Register */}
        <p className="text-center text-var(--text-muted) mt-4 sm:mt-6 text-xs sm:text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-yellow-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
