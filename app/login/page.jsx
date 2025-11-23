"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputField from "../components/InputField";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // If already logged in → redirect
  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [session]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // 🔥 UPDATED handleSubmit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    // 🔥 FIX: Fetch next-auth session and store user email locally
    const res = await fetch("/api/auth/session");
    const data = await res.json();

    if (data?.user) {
      localStorage.setItem("hm_user", JSON.stringify(data.user)); // stores email, name, etc.
      localStorage.setItem("hm_session", "active");
    }

    router.replace("/dashboard");
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
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md bg-[var(--bg-nav)] dark:bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">
        <h1 className="text-2xl sm:text-3xl font-[Poppins] text-center text-[var(--text-main)] mb-1 font-bold">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base font-[Inter] text-center text-[var(--text-muted)] mb-4">
          Login to continue managing your home.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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

          <button
            type="submit"
            className="btn-theme w-full py-2 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-[var(--text-muted)] text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <button
          onClick={() => signIn("google")}
          className="btn-theme w-full py-2 text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-100 shadow transition"
        >
          Continue with Google
        </button>

        <p className="text-center text-[var(--text-muted)] mt-4 sm:mt-6 text-xs sm:text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-yellow-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
