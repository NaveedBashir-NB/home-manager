"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputField from "../components/InputField";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Auto redirect if logged in (Google user)
  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [session]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Call Register API
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.status === 400) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    alert("Account created successfully!");

    // Auto login after register
    await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

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
        style={{ backgroundImage: "url('/bg-image.png')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/70 backdrop-blur-sm transition-colors duration-500"></div>

      {/* Form Container */}
      <div className="relative z-20 w-full mx-10 max-w-(--breakpoint-xs) bg-accent-light border-primary-dark border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">
        <h1 className="text-xl sm:text-2xl text-center text-secondary mb-1">
          Create Account
        </h1>
        <p className="text-sm sm:text-base text-center text-secondary-light mb-4">
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

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Register"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
