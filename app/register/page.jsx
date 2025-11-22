"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Check if user already exists
    const savedUser = localStorage.getItem("hm_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);

      if (parsed.email === form.email) {
        alert("User already exists. Please login.");
        return;
      }
    }

    // Save user to localStorage
    localStorage.setItem("hm_user", JSON.stringify(form));

    alert("Account created successfully!");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-image.jpg')] bg-cover bg-center relative px-4">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-20 w-full max-w-md bg-white/10 dark:bg-black/20 border border-white/20 backdrop-blur-lg rounded-xl p-8 shadow-xl">

        <h1 className="text-4xl font-playfair text-center text-white font-bold">
          Create Account
        </h1>

        <p className="text-gray-200 text-center mt-2">
          Sign up to start managing your household items.
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Name */}
          <div>
            <label className="text-gray-200">Full Name</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full mt-1 px-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-200">Email</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full mt-1 px-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
              className="w-full mt-1 px-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold shadow-lg transition"
          >
            Register
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

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
