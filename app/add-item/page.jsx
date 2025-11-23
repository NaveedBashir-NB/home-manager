"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "../components/InputField";

export default function AddItemPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "pending",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // Load categories from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("hm_categories") || "[]");

    const defaultCategories = [
      "grocery",
      "kitchen",
      "bathroom",
      "household",
      "future-needs", // new default category
    ];

    const merged = Array.from(new Set([...defaultCategories, ...saved]));

    setCategories(merged);
    localStorage.setItem("hm_categories", JSON.stringify(merged));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Save item
  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.category) {
      alert("Please fill all fields");
      return;
    }

    const newItem = {
      id: Date.now(),
      ...form,
    };

    const existing = JSON.parse(localStorage.getItem("hm_items") || "[]");
    existing.push(newItem);
    localStorage.setItem("hm_items", JSON.stringify(existing));

    router.push("/dashboard");
  }

  // Add new custom category
  function addCategory() {
    if (!newCategory.trim()) {
      alert("Enter a category name");
      return;
    }

    const formatted = newCategory.toLowerCase().replace(/\s+/g, "-");

    const updated = Array.from(new Set([...categories, formatted]));

    setCategories(updated);
    localStorage.setItem("hm_categories", JSON.stringify(updated));

    setForm({ ...form, category: formatted });
    setNewCategory("");

    alert("Category added successfully!");
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
      <div className="absolute inset-0 bg-black/5 dark:bg-black/70 backdrop-blur-sm"></div>

      {/* Form Card */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md bg-[var(--bg-nav)] dark:bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-[Poppins] text-center text-[var(--text-main)] mb-1 font-bold">
          Add New Item
        </h1>

        <p className="text-sm sm:text-base font-[Inter] text-center text-[var(--text-muted)] mb-4">
          Add an item to your home management list.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Item Name */}
          <InputField
            label="Item Name"
            type="text"
            name="name"
            placeholder="e.g., Sugar, Soap, Oil"
            onChange={handleChange}
            required
          />

          {/* Category Selection */}
          <div>
            <label className="text-sm text-[var(--text-main)] font-medium">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)] focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Add Category Field */}
          <div className="mt-3">
            <InputField
              label="Add New Category"
              type="text"
              name="newCategory"
              placeholder="e.g., Electronics, Toys"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              type="button"
              onClick={addCategory}
              className="w-full mt-2 py-2 rounded-full font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition"
            >
              Add Category
            </button>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-[var(--text-main)] font-medium">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)] focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="future-needs">Future Needs</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-2 rounded-full font-semibold border border-yellow-300 text-[var(--text-main)] hover:bg-yellow-200 transition"
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
