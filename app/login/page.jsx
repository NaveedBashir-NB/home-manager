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

    // local login (later we will implement storing users in localStorage)
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
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-image.jpg')] bg-cover bg-center relative px-4">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Card Container */}
      <div className="relative z-20 w-full max-w-md bg-white/10 dark:bg-black/20 border border-white/20 backdrop-blur-lg rounded-xl p-8 shadow-xl">

        <h1 className="text-4xl font-playfair text-center text-white font-bold">
          Welcome Back
        </h1>

        <p className="text-gray-200 text-center mt-2">
          Login to continue managing your home.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Email */}
          <div>
            <label className="text-gray-200">Email</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full mt-1 px-4 py-2 bg-white/20 text-white rounded-lg placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-200">Password</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 bg-white/20 text-white rounded-lg placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold shadow-lg transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-gray-200 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => signIn("google")}
          className="w-full bg-white text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
        >
          Continue with Google
        </button>

        {/* Link to Register */}
        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
