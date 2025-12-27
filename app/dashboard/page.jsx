"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InputField from "../components/InputField";
import toast from "react-hot-toast";
import { confirmToast } from "../components/ui/confirmToast";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories] = useState([
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items",
  ]);

  const [greeting, setGreeting] = useState("");

  // Greeting
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"
    );
  }, []);

  // Load user and items
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    setUser(session.user);
    const email = encodeURIComponent(session.user.email);

    fetch(`/api/items?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data || []);
        setFilteredItems(data || []);
      })
      .catch(() => {
        setItems([]);
        setFilteredItems([]);
      });
  }, [session, status]);

  // Filter + search logic
  useEffect(() => {
    let data = [...items];

    if (search.trim())
      data = data.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    if (categoryFilter !== "all")
      data = data.filter((i) => i.category === categoryFilter);
    if (statusFilter !== "all")
      data = data.filter((i) => i.status === statusFilter);

    setFilteredItems(data);
  }, [search, categoryFilter, statusFilter, items]);

  const refreshItems = async () => {
    if (!user?.email) return;
    const email = encodeURIComponent(user.email);
    const res = await fetch(`/api/items?email=${email}`);
    const data = await res.json();
    setItems(data || []);
  };

  const markCompleted = async (item) => {
    try {
      const payload = {
        id: item._id,
        userId: session.user.email,
        name: item.name,
        description: item.description,
        category: item.category,
        status: "completed",
      };

      const res = await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed: " + err.error);
        return;
      }

      const updatedItem = await res.json();

      setItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  async function handleDelete(itemId) {
    if (!confirmToast("Are you sure you want to delete this item?")) return;

    const res = await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: itemId,
        userId: session.user.email, // same as Add Item logic
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Item deleted successfully");
      setItems(items.filter((item) => item._id !== itemId)); // reload items after delete
    } else {
      toast.error("Delete failed: " + data.error);
    }
  }

  const goEdit = (id) => router.push(`/edit-item/${id}`);

  if (!user) return null;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* GREETING */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-1">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-secondary-light">
          Manage your daily household items easily.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-accent-light border-primary border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full mt-1 px-4 py-1 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1 px-4 py-1 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="future-needs">Future Needs</option>
          </select>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {[
          {
            label: "Add Item",
            icon: "➕",
            action: () => router.push("/add-item"),
          },
          {
            label: "All Items",
            icon: "📦",
            action: () => setStatusFilter("all"),
          },
          {
            label: "Pending",
            icon: "⏳",
            action: () => setStatusFilter("pending"),
          },
          {
            label: "Completed",
            icon: "✅",
            action: () => setStatusFilter("completed"),
          },
          {
            label: "Future Needs",
            icon: "🔮",
            action: () => setStatusFilter("future-needs"),
          },
        ].map((box) => (
          <div
            key={box.label}
            onClick={box.action}
            className="card border-2 cursor-pointer"
          >
            <div className="card-header">{box.icon}</div>
            <p className="card-title">
              {box.label}
            </p>
          </div>
        ))}
      </div>

      {/* FILTERED ITEMS LIST */}
      <h4 className="mb-3">
        Filtered Items ({filteredItems.length})
      </h4>

      <div className="bg-accent-light border-primary border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500 mb-10">
        {filteredItems.length === 0 ? (
          <p className="text-secondary-light text-sm">No items found.</p>
        ) : (
          <ul className="space-y-3">
            {Array.isArray(filteredItems) &&
              filteredItems.slice(0, 10).map((item) => (
                <li
                  key={item._id}
                  className="card text-start flex flex-col sm:flex-row justify-between px-3 py-1 space-y-2 sm:p-3"
                >
                  <div className="flex flex-col">
                    <span className="card-title font-semibold text-secondary">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="card-body">
                        {item.description}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between py-1 gap-1 sm:w-1/2 sm:max-w-75">
                    <span
                      className={`text-xs sm:text-sm sm:font-bold font-semibold px-3 sm:px-5 py-1 sm:py-2 rounded-sm my-auto ${
                        item.status === "completed"
                          ? "bg-green-500/30 text-green-800"
                          : item.status === "future-needs"
                          ? "bg-blue-500/30 text-blue-800"
                          : "bg-yellow-500/30 text-yellow-800"
                      }`}
                    >
                      {item.status === "future-needs"
                        ? "Future Needs"
                        : item.status === "pending"
                        ? "Pending"
                        : "Completed"}
                    </span>

                    <div className="flex w-2/5 max-w-30 justify-between">
                      {" "}
                      <button
                        onClick={() => goEdit(item._id)}
                        title="Edit"
                        className="text-secondary hover:text-yellow-400 transition"
                      >
                        ✏️
                      </button>
                      {item.status !== "completed" && (
                        <button
                          onClick={() => markCompleted(item)}
                          title="Mark completed"
                          className="text-green-400 hover:text-green-300 transition"
                        >
                          ✔
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
