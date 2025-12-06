// /app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  const [greeting, setGreeting] = useState("");

  // Greeting
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  // load user + fetch items + fetch categories
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    setUser(session.user);
    const email = encodeURIComponent(session.user.email);

    // fetch items from MongoDB
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

    // fetch categories from MongoDB
    fetch(`/api/categories?email=${email}`)
      .then((res) => res.json())
      .then((cats) => {
        setCategories(
          cats || ["grocery", "kitchen", "bathroom", "household", "future-needs"]
        );
      })
      .catch(() => {
        setCategories(["grocery", "kitchen", "bathroom", "household", "future-needs"]);
      });
  }, [session, status]);

  // Filter + search logic
  useEffect(() => {
    let data = [...items];

    if (search.trim()) {
      data = data.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (categoryFilter !== "all") {
      data = data.filter((i) => i.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((i) => i.status === statusFilter);
    }

    setFilteredItems(data);
  }, [search, categoryFilter, statusFilter, items]);

  const refreshItems = async () => {
    if (!user?.email) return;
    const email = encodeURIComponent(user.email);
    const res = await fetch(`/api/items?email=${email}`);
    const data = await res.json();
    setItems(data || []);
  };

  // mark completed (PUT → MongoDB)
  const markCompleted = async (id) => {
    if (!user?.email) return;

    const existing = items.find((i) => i._id === id || i.id === id);
    if (!existing) return;

    const updatedItem = { ...existing, status: "completed" };

    await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        item: updatedItem,
      }),
    });

    await refreshItems();
  };

  // delete item (DELETE → MongoDB)
  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    if (!user?.email) return;

    const email = encodeURIComponent(user.email);

    await fetch(`/api/items/${id}?email=${email}`, {
      method: "DELETE",
    });

    await refreshItems();
  };

  const goEdit = (id) => {
    router.push(`/edit-item/${id}`);
  };

  if (!user) return null;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">

      {/* GREETING */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage your daily household items easily.
        </p>
      </div>

      {/* SEARCH + FILTER UI (UNCHANGED) */}
      <div className="bg-[var(--card-bg)] border border-[var(--dropdown-border)] rounded-xl p-5 mb-10 shadow-lg backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 border border-[var(--dropdown-border)] text-[var(--text-main)] focus:outline-none focus:border-yellow-300 transition"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 border border-[var(--dropdown-border)] text-[var(--text-main)] focus:outline-none focus:border-yellow-300 transition"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 border border-[var(--dropdown-border)] text-[var(--text-main)] focus:outline-none focus:border-yellow-300 transition"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="future-needs">Future Needs</option>
          </select>
        </div>
      </div>

      {/* QUICK ACTIONS (UNCHANGED) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Add Item", icon: "➕", action: () => router.push("/add-item") },
          { label: "All Items", icon: "📦", action: () => setStatusFilter("all") },
          { label: "Pending", icon: "⏳", action: () => setStatusFilter("pending") },
          { label: "Completed", icon: "✅", action: () => setStatusFilter("completed") },
          { label: "Future Needs", icon: "🔮", action: () => setStatusFilter("future-needs") },
        ].map((box) => (
          <div
            key={box.label}
            onClick={box.action}
            className="cursor-pointer bg-[var(--card-bg)] border border-[var(--dropdown-border)] rounded-xl p-6 text-center hover:scale-105 transition shadow-md select-none"
          >
            <div className="text-3xl mb-2">{box.icon}</div>
            <p className="text-sm font-semibold text-[var(--text-main)]">{box.label}</p>
          </div>
        ))}
      </div>

      {/* FILTERED RESULTS LIST (UNCHANGED) */}
      <h2 className="text-xl font-bold mb-3 text-[var(--text-main)]">
        Filtered Items ({filteredItems.length})
      </h2>

      <div className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--dropdown-border)] shadow mb-10">
        {filteredItems.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No items found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredItems.slice(0, 10).map((item) => (
              <li
                key={item._id || item.id}
                className="flex justify-between items-center p-3 rounded-lg bg-black/10 dark:bg-white/10"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[var(--text-main)]">
                    {item.name}
                  </span>
                  {item.description && (
                    <span className="text-sm text-[var(--text-muted)] mt-0.5">
                      {item.description}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-5 py-2 rounded-full ${
                      item.status === "completed"
                        ? "bg-green-500/30 text-green-800"
                        : item.status === "future-needs"
                        ? "bg-blue-500/30 text-blue-800"
                        : "bg-yellow-500/30 text-yellow-800"
                    }`}
                  >
                    {item.status === "future-needs" ? "Future Needs" : item.status}
                  </span>

                  <button
                    onClick={() => goEdit(item._id || item.id)}
                    title="Edit"
                    className="text-[var(--text-main)] hover:text-yellow-400 transition"
                  >
                    ✏️
                  </button>

                  {item.status !== "completed" && (
                    <button
                      onClick={() => markCompleted(item._id || item.id)}
                      title="Mark completed"
                      className="text-green-400 hover:text-green-300 transition"
                    >
                      ✔
                    </button>
                  )}

                  <button
                    onClick={() => deleteItem(item._id || item.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
