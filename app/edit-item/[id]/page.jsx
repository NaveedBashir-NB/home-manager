"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import InputField from "../../components/InputField";
import toast from "react-hot-toast";

export default function EditItemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    status: "pending",
  });
  const [categories] = useState([
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items",
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // wait for session

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!itemId) {
      toast.error("No item selected to edit");
      router.push("/dashboard");
      return;
    }

    // fetch the item
    fetchItem();
  }, [session, status, itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const email = encodeURIComponent(session.user.email);
      const res = await fetch(`/api/items?email=${email}`);
      const data = await res.json();

      const item = data.find((i) => i._id === itemId);
      if (!item) throw new Error("Item not found");

      setForm({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        status: item.status || "pending",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      router.push("/dashboard");
    } finally {
      setLoading(false); // **important**: set loading to false no matter what
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category)
      return toast.error("Fill required fields");

    try {
      const res = await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          userId: session.user.email,
          ...form,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Item updated successfully");
        router.push("/dashboard");
      } else {
        toast.error("Failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating the item.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

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
      <div className="relative z-20 w-full mx-4 xs:mx-5 max-w-(--breakpoint-xs) bg-accent-light border-primary border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500">
        <h1 className="text-xl sm:text-2xl text-center text-secondary mb-1">
          Edit Item
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Item Name"
            type="text"
            name="name"
            placeholder="e.g., Sugar"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Description"
            type="text"
            name="description"
            placeholder="Optional details..."
            value={form.description}
            onChange={handleChange}
          />

          <div>
            <label className="text-secondary font-semibold text-xs sm:text-sm flex items-center gap-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
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
            <label className="text-secondary font-semibold text-xs sm:text-sm flex items-center gap-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="future-needs">Future Needs</option>
            </select>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-outline w-full"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary w-full">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
