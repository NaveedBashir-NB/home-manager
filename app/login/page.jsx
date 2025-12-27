"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputField from "../components/InputField";
import toast from "react-hot-toast";

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
      toast.error(result.error);
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
      {/* Fullscreen Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg-image.png')" }}
      ></div>

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: "var(--intro-overlay)" }}
      ></div>

      {/* Floating Circles */}
      <div className="absolute w-60 h-60 bg-primary rounded-full opacity-15 animate-float1 top-12 left-12"></div>
      <div className="absolute w-44 h-44 bg-primary-light rounded-full opacity-20 animate-float2 top-50 right-75"></div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float1 {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(200px);
          }
        }
        @keyframes float2 {
          0%,
          100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(-600px);
          }
        }
        .animate-float1 {
          animation: float1 6s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 8s ease-in-out infinite;
        }
      `}</style>

      {/* Form Container */}
      <div className="relative z-20 w-full mx-4 xs:mx-10 max-w-(--breakpoint-xs) bg-accent-light border-primary border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">
        <h1 className="text-xl sm:text-2xl text-center text-secondary mb-1">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base text-center text-secondary-light mb-4">
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
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-primary"></div>
          <span className="text-secondary-light text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-primary"></div>
        </div>

        <button
          onClick={() => signIn("google")}
          className="btn btn-outline w-full"
        >
          Continue with Google
        </button>

        <p className="text-center text-secondary-light mt-4 sm:mt-6 text-xs sm:text-sm">
          Don’t have an account?{"  "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
