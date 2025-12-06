"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "../components/InputField";
import { useSession } from "next-auth/react";

export default function AddItemPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    status: "pending",
  });

  const [categories, setCategories] = useState([
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items",
  ]);

  // Wait for session to load
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) router.push("/login");
  }, [session, status, router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.category) return alert("Fill required fields");

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const payload = {
      ...form,
      userId: session.user.email, // must match API expectation
    };

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/dashboard");
    else {
      const err = await res.json();
      alert("Failed: " + (err.error || "unknown"));
    }
  }

  return (
    <div
      className="flex items-center justify-center relative w-screen overflow-x-hidden"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-image.png')" }}
      ></div>
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>

      <div className="relative z-20 w-full max-w-md bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-1">Add New Item</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Item Name"
            type="text"
            name="name"
            placeholder="e.g., Sugar"
            onChange={handleChange}
            required
          />
          <InputField
            label="Description"
            type="text"
            name="description"
            placeholder="Optional details..."
            onChange={handleChange}
          />

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-yellow-200"
            >
              <option value="">Select category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-yellow-200"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="future-needs">Future Needs</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-2 border border-yellow-300 rounded-full"
            >
              Cancel
            </button>
            <button type="submit" className="btn-theme w-full py-2">
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
