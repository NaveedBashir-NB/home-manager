"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import { ArrowLeft } from "lucide-react";

export default function EditItemPage({ params }) {
  const router = useRouter();
  const itemId = params.id;

  const [item, setItem] = useState({
    name: "",
    category: "",
    quantity: "",
    description: "",
  });

  // Load item from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hm_items");
    if (stored) {
      const items = JSON.parse(stored);
      const selected = items[itemId];

      if (!selected) router.push("/dashboard"); // Invalid index
      else setItem(selected);
    }
  }, [itemId, router]);

  function handleChange(e) {
    setItem({ ...item, [e.target.name]: e.target.value });
  }

  function handleSave() {
    const stored = JSON.parse(localStorage.getItem("hm_items") || "[]");
    stored[itemId] = item;
    localStorage.setItem("hm_items", JSON.stringify(stored));
    router.push("/dashboard");
  }

  return (
    <div className="relative w-screen min-h-screen pt-24 transition-colors duration-500">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/70 backdrop-blur-sm"></div>

      {/* Content */}
      <main className="relative z-20 container max-w-xl pb-20">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-[var(--text-main)] hover:text-yellow-300 transition"
        >
          <ArrowLeft /> Back
        </button>

        {/* Card */}
        <div
          className="
            bg-[var(--bg-nav)]
            border-2 border-yellow-300
            backdrop-blur-xl
            rounded-2xl
            shadow-xl
            p-8
            space-y-6
          "
        >
          <h1 className="h1 text-center mb-4">Edit Item</h1>

          {/* Fields */}
          <InputField
            label="Item Name"
            name="name"
            value={item.name}
            onChange={handleChange}
            placeholder="Enter item name"
          />

          <InputField
            label="Category"
            name="category"
            value={item.category}
            onChange={handleChange}
            placeholder="Enter category"
          />

          <InputField
            label="Quantity"
            name="quantity"
            value={item.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
          />

          <InputField
            label="Description"
            name="description"
            value={item.description}
            onChange={handleChange}
            placeholder="Enter description"
          />

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button onClick={handleSave} className="btn-theme">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
