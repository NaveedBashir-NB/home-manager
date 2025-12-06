"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputField from "@/app/components/InputField";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localSession = typeof window !== "undefined" && localStorage.getItem("hm_session") === "active";
    const localUser = localSession ? JSON.parse(localStorage.getItem("hm_user") || "null") : null;
    setUser(localUser);

    if (!localUser) router.push("/login");

    const fetchItem = async () => {
      const res = await fetch(`/api/items?email=${localUser.email}`);
      const data = await res.json();
      const found = data.find(i => i._id === params.id);
      setItem(found || null);

      const cats = Array.from(new Set(data.map(i => i.category)));
      setCategories(cats);
    };
    fetchItem();
  }, [params.id, router]);

  function handleChange(e) {
    setItem({ ...item, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!item.name || !item.category) return alert("Please fill all fields");

    const res = await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, item }),
    });

    if (res.ok) router.push("/dashboard");
    else alert("Failed to update item");
  }

  function handleAddCategory() {
    if (!newCategory.trim()) return;
    const formatted = newCategory.toLowerCase().replace(/\s+/g, "-");
    if (!categories.includes(formatted)) setCategories([...categories, formatted]);
    setItem({ ...item, category: formatted });
    setNewCategory("");
  }

  if (!item) return null;

  return (
    <div className="flex items-center justify-center relative w-screen overflow-x-hidden" style={{ minHeight: "calc(100vh - 80px)" }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}></div>
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>

      <div className="relative z-20 w-full max-w-md bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-1">Edit Item</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Item Name" type="text" name="name" value={item.name} onChange={handleChange} required />
          <InputField label="Description" type="text" name="description" value={item.description} onChange={handleChange} />

          <div>
            <label className="text-sm font-medium">Category</label>
            <select name="category" value={item.category} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg border border-yellow-200">
              <option value="">Select category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>

            <div className="mt-2 flex gap-2">
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Add new category" className="w-full p-2 rounded-lg border border-yellow-200" />
              <button type="button" onClick={handleAddCategory} className="px-3 py-2 bg-yellow-300 rounded-lg font-semibold">Add</button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select name="status" value={item.status} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg border border-yellow-200">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="future-needs">Future Needs</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => router.push("/dashboard")} className="w-full py-2 border border-yellow-300 rounded-full">Cancel</button>
            <button type="submit" className="btn-theme w-full py-2">Update Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
