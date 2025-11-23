"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InputField from "@/app/components/InputField";

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // load current user (local session)
    const localSession = typeof window !== "undefined" && localStorage.getItem("hm_session") === "active";
    const localUser = localSession ? JSON.parse(localStorage.getItem("hm_user") || "null") : null;
    const nextAuthUser = null; // if using next-auth, you could combine similarly
    const activeUser = nextAuthUser || localUser;
    setUser(activeUser);

    if (!activeUser) {
      router.push("/login");
      return;
    }

    const emailSafe = activeUser.email.replace(/[@.]/g, "_");
    const itemsKey = `hm_items_${emailSafe}`;
    const savedItems = JSON.parse(localStorage.getItem(itemsKey) || "[]");
    const found = savedItems.find((i) => i.id == params.id);

    if (!found) {
      alert("Item not found!");
      router.push("/dashboard");
      return;
    }

    setItem(found);

    const catsKey = `hm_categories_${emailSafe}`;
    const savedCategories = JSON.parse(localStorage.getItem(catsKey) || "[]");
    setCategories(savedCategories);
  }, [params.id, router]);

  function handleChange(e) {
    setItem({ ...item, [e.target.name]: e.target.value });
  }

  function handleAddCategory() {
    if (!newCategory.trim()) return;

    const formatted = newCategory.toLowerCase().replace(/\s+/g, "-");
    const emailSafe = user.email.replace(/[@.]/g, "_");
    const catsKey = `hm_categories_${emailSafe}`;
    const saved = JSON.parse(localStorage.getItem(catsKey) || "[]");
    const updated = Array.from(new Set([...saved, formatted]));
    localStorage.setItem(catsKey, JSON.stringify(updated));
    setCategories(updated);

    setItem({ ...item, category: formatted });
    setNewCategory("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!item.name || !item.category) {
      alert("Please fill all fields");
      return;
    }

    const emailSafe = user.email.replace(/[@.]/g, "_");
    const itemsKey = `hm_items_${emailSafe}`;
    const items = JSON.parse(localStorage.getItem(itemsKey) || "[]");
    const updated = items.map((i) => (i.id == item.id ? item : i));
    localStorage.setItem(itemsKey, JSON.stringify(updated));

    router.push("/dashboard");
  }

  if (!item) return null;

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

      {/* Form Card */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md bg-[var(--bg-nav)] dark:bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">
        <h1 className="text-2xl sm:text-3xl font-[Poppins] text-center text-[var(--text-main)] mb-1 font-bold">
          Edit Item
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Item Name */}
          <InputField label="Item Name" type="text" name="name" placeholder="e.g., Sugar, Soap, Oil" value={item.name} onChange={handleChange} required />

          {/* Category Selector */}
          <div>
            <label className="text-sm text-[var(--text-main)] font-medium">Category</label>
            <select name="category" value={item.category} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)]">
              <option value="">Select category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Add new category */}
            <div className="flex gap-2 mt-2">
              <input type="text" placeholder="Add new category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full p-2 rounded-lg border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)]" />
              <button type="button" onClick={handleAddCategory} className="px-3 py-2 text-sm rounded-lg bg-yellow-300 font-semibold">Add</button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-[var(--text-main)] font-medium">Status</label>
            <select name="status" value={item.status} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)]">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="future-needs">Future Needs</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button type="button" onClick={() => router.push("/dashboard")} className="w-full py-2 rounded-full font-semibold border border-yellow-300 text-[var(--text-main)] hover:bg-yellow-200">
              Cancel
            </button>

            <button type="submit" className="btn-theme w-full py-2">Update Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
